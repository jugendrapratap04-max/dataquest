"use client";
import React, { useState } from "react";

export function ChatPanel(): JSX.Element {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<{ from: "user" | "ai"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!message.trim()) return;
    const m = message.trim();
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: m }),
      });
      const j = await res.json();
      if (j.ok) {
        setHistory((h) => [...h, { from: 'user', text: m }, { from: 'ai', text: j.reply }]);
        setMessage('');
      } else {
        alert(j.error || 'AI request failed');
      }
    } catch (e) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-chat">
      <div className="ai-chat-history" style={{ maxHeight: 300, overflow: 'auto', padding: 8 }}>
        {history.map((h, i) => (
          <div key={i} style={{ margin: '6px 0' }}>
            <div style={{ fontSize: 12, color: '#666' }}>{h.from === 'user' ? 'You' : 'AI Mentor'}</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{h.text}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask the AI Mentor..."
          style={{ flex: 1 }}
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !message.trim()} className="btn btn-primary">
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
