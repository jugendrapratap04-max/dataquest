/*
 * Byte writes Markdown. The chat panel used to print it.
 *
 * Every reply came back with its asterisks showing — "Tumhara naam **Jeetu**
 * hai" on screen, bullet lists as lines beginning with a star, code as an
 * unformatted run of text inside a paragraph. The model was writing structure
 * and the panel was throwing it away.
 *
 * This renders what Gemini actually emits: headings, bullet and numbered lists,
 * bold, italics, inline code, fenced code and links.
 *
 * ── On the four copies of mdLite ──────────────────────────────────────────
 * PracticeWorkbench, SqlWorkbench, HtmlWorkbench and Asm8085Workbench each
 * carry their own `mdLite`. They render problem statements, which are short and
 * have no lists or headings, so none of them was enough here. They should all
 * end up on this one — but collapsing four components is its own change, not
 * something to fold into a chat redesign.
 *
 * ── On safety ─────────────────────────────────────────────────────────────
 * This output goes through dangerouslySetInnerHTML, so the order below is not
 * a style choice. Everything is escaped FIRST and markup is only inserted
 * afterwards, which means no run of characters coming back from the model can
 * become a tag. Links are checked against an allowlist rather than trusted:
 * `[click](javascript:...)` is exactly the shape a model can be talked into
 * producing.
 */

const escapeHtml = (raw: string) =>
  raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/*
 * Only somewhere this app can actually send a student.
 *
 * `https:` and `http:` for the open web, and a leading single slash for a route
 * inside Etudo. `//evil.com` is rejected on purpose — it looks relative and is
 * not. Anything else is rendered as plain text rather than dropped, so a
 * student can still see what Byte meant.
 */
function safeHref(url: string): string | null {
  const trimmed = url.trim();

  if (/^https?:\/\/[^\s"']+$/i.test(trimmed)) {
    return trimmed;
  }

  if (/^\/(?!\/)[^\s"']*$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/** Bold, italics, inline code and links — the things that live inside a line. */
function inline(text: string): string {
  return (
    text
      /*
       * Inline code first. Everything after this would happily reach inside a
       * `**x**` written between backticks and mark it up, which is precisely
       * what a student asking "why is my markdown not showing" does not want.
       */
      .replace(
        /`([^`]+)`/g,
        '<code class="bmd-code">$1</code>'
      )

      .replace(
        /\*\*([^*]+)\*\*/g,
        "<strong>$1</strong>"
      )

      /*
       * A single star, but never one that belongs to a `**` pair — the bold
       * rule above has already consumed those, so anything left is emphasis.
       */
      .replace(
        /(^|[^*])\*([^*\n]+)\*(?!\*)/g,
        "$1<em>$2</em>"
      )

      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        (whole, label: string, url: string) => {
          const href = safeHref(url);

          if (!href) {
            return whole;
          }

          const external = /^https?:/i.test(href);

          return `<a class="bmd-link" href="${href}"${
            external
              ? ' target="_blank" rel="noopener noreferrer"'
              : ""
          }>${label}</a>`;
        }
      )
  );
}

/**
 * Byte's Markdown as HTML.
 *
 * The input is escaped before anything else happens, so the return value can
 * only contain the tags this file writes.
 */
export function renderByteMarkdown(
  markdown: string
): string {
  /*
   * Fenced blocks come out before any line-by-line work.
   *
   * They are the one construct whose insides must survive untouched: a `#` at
   * the start of a line in a Python snippet is a comment, not a heading, and a
   * list of shell flags is not a bullet list.
   */
  const fences: string[] = [];

  const withoutFences = escapeHtml(markdown).replace(
    /```[a-zA-Z0-9+-]*\n?([\s\S]*?)```/g,
    (_whole, body: string) => {
      fences.push(body.replace(/\n$/, ""));
      return `\u0000FENCE${fences.length - 1}\u0000`;
    }
  );

  const lines = withoutFences.split("\n");
  const out: string[] = [];

  /*
   * One open list at a time. Byte does not nest them, and a parser that
   * pretends to handle nesting it never receives is a parser with untested
   * branches in it.
   */
  let list: "ul" | "ol" | null = null;

  let paragraph: string[] = [];

  const closeParagraph = () => {
    if (paragraph.length === 0) {
      return;
    }

    out.push(
      `<p>${inline(paragraph.join(" "))}</p>`
    );

    paragraph = [];
  };

  const closeList = () => {
    if (!list) {
      return;
    }

    out.push(`</${list}>`);
    list = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    /* A fence placeholder always sits alone on its line. */
    const fence = trimmed.match(
      /^\u0000FENCE(\d+)\u0000$/
    );

    if (fence) {
      closeParagraph();
      closeList();

      out.push(
        `<pre class="bmd-pre"><code>${
          fences[Number(fence[1])]
        }</code></pre>`
      );

      continue;
    }

    if (trimmed === "") {
      closeParagraph();
      closeList();
      continue;
    }

    /* A rule, written as three or more dashes, stars or underscores. */
    if (/^([-*_])\1{2,}$/.test(trimmed)) {
      closeParagraph();
      closeList();
      out.push('<hr class="bmd-rule" />');
      continue;
    }

    const heading = trimmed.match(
      /^(#{1,4})\s+(.*)$/
    );

    if (heading) {
      closeParagraph();
      closeList();

      /*
       * Levels are shifted down. The panel already has an h-level of its own
       * in the header, and a model that opens with "# Variables" should not be
       * able to plant a page-level heading inside a chat bubble.
       */
      const level = Math.min(
        6,
        heading[1].length + 3
      );

      out.push(
        `<h${level} class="bmd-h">${inline(
          heading[2]
        )}</h${level}>`
      );

      continue;
    }

    const bullet = trimmed.match(
      /^[-*+]\s+(.*)$/
    );

    if (bullet) {
      closeParagraph();

      if (list !== "ul") {
        closeList();
        out.push('<ul class="bmd-list">');
        list = "ul";
      }

      out.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }

    const numbered = trimmed.match(
      /^\d+[.)]\s+(.*)$/
    );

    if (numbered) {
      closeParagraph();

      if (list !== "ol") {
        closeList();
        out.push('<ol class="bmd-list">');
        list = "ol";
      }

      out.push(
        `<li>${inline(numbered[1])}</li>`
      );

      continue;
    }

    const quote = trimmed.match(/^&gt;\s?(.*)$/);

    if (quote) {
      closeParagraph();
      closeList();

      out.push(
        `<blockquote class="bmd-quote">${inline(
          quote[1]
        )}</blockquote>`
      );

      continue;
    }

    /*
     * An ordinary line. Collected rather than emitted, so a paragraph the
     * model wrapped across several lines becomes one paragraph instead of a
     * stack of short ones.
     */
    if (list) {
      /*
       * A continuation line under a list item belongs to that item — emitting
       * a paragraph here would break out of the list mid-way.
       */
      const previous = out.pop();

      if (previous?.startsWith("<li>")) {
        out.push(
          previous.replace(
            /<\/li>$/,
            ` ${inline(trimmed)}</li>`
          )
        );

        continue;
      }

      if (previous) {
        out.push(previous);
      }
    }

    paragraph.push(trimmed);
  }

  closeParagraph();
  closeList();

  return out.join("");
}
