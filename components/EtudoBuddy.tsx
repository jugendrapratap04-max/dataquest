"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { onPetEvent } from "@/lib/pet-events";

type Message = {
  from: "buddy" | "student";
  text: string;
};

type PageContext = {
  label: string;
  title: string;
  statement: string;
};

type HistoryMessage = {
  role: "user" | "model";
  text: string;
};

const CHAT_KEY = "etudo-byte-chat-v1";
const MAX_MESSAGES = 16;

function readStoredMessages(): Message[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = JSON.parse(
      localStorage.getItem(CHAT_KEY) || "[]"
    );

    if (!Array.isArray(saved)) {
      return [];
    }

    return saved
      .filter(
        (item): item is Message =>
          item &&
          (item.from === "buddy" ||
            item.from === "student") &&
          typeof item.text === "string"
      )
      .slice(-MAX_MESSAGES);
  } catch {
    return [];
  }
}

function getPlace(pathname: string): string {
  if (pathname.startsWith("/practice")) {
    return "practice workspace";
  }

  if (pathname.startsWith("/learn")) {
    return "current lesson";
  }

  if (pathname.startsWith("/challenge")) {
    return "challenge";
  }

  if (pathname.startsWith("/book")) {
    return "written notes";
  }

  return "Etudo";
}

function getPageContext(pathname: string): PageContext {
  const label = getPlace(pathname);

  if (typeof document === "undefined") {
    return {
      label,
      title: label,
      statement: "",
    };
  }

  const main = document.querySelector("main");

  const title =
    main?.querySelector("h1")?.textContent?.trim() ||
    label;

  const text =
    main?.textContent?.replace(/\s+/g, " ").trim() ||
    "";

  const titleIndex = text.indexOf(title);

  let statement = text;

  if (titleIndex >= 0) {
    statement = text.slice(
      titleIndex + title.length,
      titleIndex + title.length + 1800
    );
  }

  return {
    label,
    title,
    statement,
  };
}

export function EtudoBuddy() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>(
    readStoredMessages
  );

  const input = useRef<HTMLInputElement>(null);

  const page = getPageContext(pathname);

  /*
   * Save chat locally.
   * This keeps Byte's conversation on this device.
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        CHAT_KEY,
        JSON.stringify(
          messages.slice(-MAX_MESSAGES)
        )
      );
    } catch {
      // Ignore localStorage errors.
    }
  }, [messages]);

  /*
   * Clicking Byte opens Byte.
   *
   * The pet dispatches on window and this listens — the two
   * components never reference each other, so the chat still
   * works on screens where the pet is not rendered.
   */
  useEffect(
    () =>
      onPetEvent("pet:open-chat", () => {
        setOpen(true);
      }),
    []
  );

  /*
   * Focus input when Byte opens.
   * Escape closes the chat.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      input.current?.focus();
    }, 50);

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.clearTimeout(timer);

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  /*
   * Send message to Gemini through:
   *
   * EtudoBuddy
   *      ↓
   * /api/buddy
   *      ↓
   * Gemini
   *      ↓
   * Byte response
   */
  async function ask(
    value: string = question
  ): Promise<void> {
    const text = value.trim();

    if (!text || loading) {
      return;
    }

    setQuestion("");
    setLoading(true);

    /*
     * Keep previous conversation for Gemini.
     */
    const history: HistoryMessage[] =
      messages.slice(-10).map((message) => ({
        role:
          message.from === "student"
            ? "user"
            : "model",
        text: message.text,
      }));

    /*
     * Immediately show student's message.
     */
    setMessages((current) => {
      const updated: Message[] = [
        ...current,
        {
          from: "student",
          text,
        },
      ];

      return updated.slice(-MAX_MESSAGES);
    });

    try {
      /*
       * Call our secure server API.
       *
       * The Gemini API key NEVER goes
       * into this client component.
       */
      const response = await fetch(
        "/api/buddy",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: text,

            page: {
              label: page.label,
              title: page.title,
              statement: page.statement,
            },

            history,
          }),
        }
      );

      const data: {
        text?: string;
        error?: string;
      } = await response.json();

      /*
       * Backend returned an error.
       */
      if (!response.ok) {
        throw new Error(
          data.error ||
            "Byte could not answer."
        );
      }

      const reply =
        typeof data.text === "string"
          ? data.text.trim()
          : "";

      /*
       * Add Gemini response to chat.
       */
      setMessages((current) => {
        const updated: Message[] = [
          ...current,
          {
            from: "buddy",
            text:
              reply ||
              "I couldn't generate a response. Please try again.",
          },
        ];

        return updated.slice(-MAX_MESSAGES);
      });
    } catch (error) {
      console.error(
        "Byte API error:",
        error
      );

      /*
       * Show error in chat.
       */
      setMessages((current) => {
        const updated: Message[] = [
          ...current,
          {
            from: "buddy",
            text:
              "Sorry, I couldn't connect to Byte right now. Please try again.",
          },
        ];

        return updated.slice(-MAX_MESSAGES);
      });
    } finally {
      setLoading(false);
    }
  }

  /*
   * Clear Byte conversation.
   */
  function clearChat(): void {
    setMessages([]);

    try {
      localStorage.removeItem(CHAT_KEY);
    } catch {
      // Ignore localStorage errors.
    }

    input.current?.focus();
  }

  return (
    <>
      {/*
        Phone fallback. On a desktop you open Byte by clicking Byte, and CSS
        hides this; below 819px the pet is the hidden one and this is the only
        way in. It stays in the markup rather than behind a width check in JS,
        because a resize must not be able to leave the student with neither.
      */}
      <button
        type="button"
        className="buddy-fab"
        onClick={() => setOpen(true)}
        aria-label="Ask Byte, your Etudo study companion"
        aria-expanded={open}
      >
        Ask Byte
      </button>

      {open && (
        <>
          {/* Background overlay */}
          <div
            className="buddy-backdrop"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Byte chat panel */}
          <section
            className="buddy-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Byte study companion"
          >
            {/* Header */}
            <div className="buddy-header">
              <div>
                <strong>Byte</strong>

                <span>
                  With you in {page.title}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close Byte"
              >
                ×
              </button>
            </div>

            {/* Chat content */}
            <div className="buddy-content">
              {/* Intro */}
              <div className="buddy-intro">
                <strong>
                  Hi! I'm Byte 👋
                </strong>

                <p>
                  I'm your Etudo AI study
                  companion. Ask me about this
                  lesson, your code, an error,
                  revision, or anything you don't
                  understand.
                </p>
              </div>

              {/* Messages */}
              {messages.map(
                (message, index) => (
                  <p
                    className={`buddy-msg ${message.from}`}
                    key={`${message.from}-${index}`}
                  >
                    {message.text}
                  </p>
                )
              )}

              {/* Loading */}
              {loading && (
                <p className="buddy-msg buddy">
                  Byte is thinking...
                </p>
              )}

              {/* Quick actions */}
              {messages.length === 0 &&
                !loading && (
                  <div className="buddy-suggestions">
                    <button
                      type="button"
                      onClick={() =>
                        void ask(
                          "Give me a hint for this step"
                        )
                      }
                    >
                      Give me a hint
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void ask(
                          "Explain this topic simply"
                        )
                      }
                    >
                      Explain this
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void ask(
                          "Help me revise this topic"
                        )
                      }
                    >
                      Help me revise
                    </button>
                  </div>
                )}
            </div>

            {/* Input */}
            <form
              className="buddy-input"
              onSubmit={(event) => {
                event.preventDefault();
                void ask();
              }}
            >
              <input
                ref={input}
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value
                  )
                }
                placeholder="Ask Byte about this page or just chat..."
                disabled={loading}
                autoComplete="off"
                aria-label="Message Byte"
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  !question.trim()
                }
              >
                {loading ? "..." : "Send"}
              </button>
            </form>

            {/* Footer */}
            <div className="buddy-footer">
              <span>
                Gemini-powered · Page-aware
              </span>

              {/* Always visible */}
              <button
                type="button"
                onClick={clearChat}
                disabled={
                  messages.length === 0
                }
              >
                Clear chat
              </button>
            </div>
          </section>
        </>
      )}
    </>
  );
}