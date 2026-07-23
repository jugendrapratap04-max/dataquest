"use client";

import { useState } from "react";

/* Results verified in real Python 3.12. Python's privacy is unusual: it is
 * mostly by CONVENTION, not enforcement. This lab makes that concrete — you try
 * to reach an Account's fields from outside, and each attempt shows what Python
 * actually does: public works, a single _ works but says "please don't", a
 * double __ blocks the plain name — yet the mangled name still gets in. The one
 * right way is the method. */

type Access = {
  code: string;
  verdict: "allowed" | "discouraged" | "blocked" | "escape" | "intended";
  result: string;
  note: string;
};

const ACCESSES: Access[] = [
  {
    code: "a.owner",
    verdict: "allowed",
    result: '"Freya"',
    note: "Public. No underscore — meant to be read and written from anywhere.",
  },
  {
    code: "a._bank",
    verdict: "discouraged",
    result: '"HDFC"',
    note: "A single _ means \"internal — please don't touch\". It is only a convention: Python still lets you read it. Tools and teammates will warn you, nothing stops you.",
  },
  {
    code: "a.__balance",
    verdict: "blocked",
    result: "AttributeError",
    note: "A double __ triggers name mangling. The attribute is not called __balance on the object at all, so this plain name fails.",
  },
  {
    code: "a._Account__balance",
    verdict: "escape",
    result: "100",
    note: "The mangled name. __balance was secretly renamed to _Account__balance, and that DOES work — proof that Python privacy is not a lock, it is a speed bump.",
  },
  {
    code: "a.balance()",
    verdict: "intended",
    result: "100",
    note: "The right way in. The method is the public door to private data — and it is where you put validation, like refusing a negative deposit.",
  },
];

const VERDICT: Record<Access["verdict"], { label: string; cls: string }> = {
  allowed: { label: "✓ public — fine", cls: "ok" },
  discouraged: { label: "⚠ works, but don't", cls: "warn" },
  blocked: { label: "✕ blocked", cls: "bad" },
  escape: { label: "🔓 escape hatch", cls: "warn" },
  intended: { label: "✓ the intended way", cls: "ok" },
};

export function EncapsulationLab() {
  const [pick, setPick] = useState(0);
  const a = ACCESSES[pick];
  const v = VERDICT[a.verdict];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔒 Encapsulation Lab — how private is a Python attribute?</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 10px" }}>
        An <code>Account</code> keeps three fields at three levels. Try to reach each one <b>from outside</b>
        the class and see what Python really does.
      </p>

      <div className="en-src">
        {"class Account:"}<br />
        {"    self.owner = \"Freya\"       # public"}<br />
        {"    self._bank = \"HDFC\"        # _ protected (convention)"}<br />
        {"    self.__balance = 100       # __ private (mangled)"}
      </div>

      <div className="viz-controls" style={{ margin: "12px 0" }}>
        {ACCESSES.map((x, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""}`} onClick={() => setPick(i)}>{x.code}</button>
        ))}
      </div>

      <div className={`en-result ${v.cls}`}>
        <span className="en-code">{a.code}</span>
        <span className="en-arrow">→</span>
        <span className="en-val">{a.result}</span>
        <span className={`en-verdict ${v.cls}`}>{v.label}</span>
      </div>

      <div className="imp-note" style={{ marginTop: 12 }}>{a.note}</div>

      {a.verdict === "escape" && (
        <div className="note warn" style={{ marginTop: 10 }}>
          <span className="i">⚠️</span>
          <div>
            This is the point: <code>__name</code> is not truly private, it is renamed to{" "}
            <code>_Class__name</code> to avoid <b>accidental</b> clashes between a class and its
            subclasses — not to lock anyone out. Python trusts you: &quot;we are all adults here&quot;.
          </div>
        </div>
      )}
    </div>
  );
}
