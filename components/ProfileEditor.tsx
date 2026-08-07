"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { AVATAR_EMOJI } from "@/lib/profile";

const MAX_BIO = 280;
const MAX_GOAL = 80;
const MAX_ROLE = 60;

/** The editable part of a profile: avatar, title, goal, bio.
 *
 *  Everything else on the page — level, rank, streak, achievements, timeline —
 *  is derived from work the student did and has no form here on purpose. There
 *  is nothing on this page that can award you anything.
 *
 *  Opens closed. A profile you are reading should look like a profile, not like
 *  a settings screen with your name in it. */
export function ProfileEditor({
  name,
  initial,
}: {
  name: string;
  initial: {
    role: string; goal: string | null; bio: string | null; avatarEmoji: string | null;
    username: string | null; publicProfile: boolean;
  };
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(initial.role);
  const [goal, setGoal] = useState(initial.goal ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [emoji, setEmoji] = useState<string | null>(initial.avatarEmoji);
  const [username, setUsername] = useState(initial.username ?? "");
  const [isPublic, setIsPublic] = useState(initial.publicProfile);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  // Typed as it will be stored, so the preview under the field is the real
  // address and not an optimistic version of it.
  const slug = username.trim().toLowerCase();

  // Read from the browser rather than written into the source. Naming a domain
  // here would put whatever it said in front of every student, on every
  // deployment, whether or not the app was served from it.
  //
  // No state and no effect: the form is closed on first render, so the only
  // renders that reach the preview happen after mount, on the client, where
  // `window` exists. There is no server render of this text for hydration to
  // disagree with.
  const host = typeof window === "undefined" ? "" : window.location.host;

  async function save() {
    if (!role.trim()) { setNote("A title cannot be empty."); return; }
    setSaving(true);
    setNote(null);
    const r = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: role.trim(), goal, bio, avatarEmoji: emoji,
        username: slug, publicProfile: isPublic,
      }),
    }).then((x) => x.json()).catch(() => null);
    setSaving(false);

    if (!r?.ok) {
      // A failed save that closes the form loses what you typed. Say so and
      // keep it open instead.
      setNote(r?.error ?? "Could not save — check your connection and try again.");
      return;
    }
    // The page is server-rendered, so a reload is what makes the new values
    // appear everywhere they are used, sidebar included.
    window.location.reload();
  }

  if (!open) {
    return (
      <button className="btn btn-ghost prof-edit" onClick={() => setOpen(true)}>
        Edit profile
      </button>
    );
  }

  return (
    <div className="prof-form">
      <div className="pf-row">
        <div className="pf-lbl">Avatar</div>
        <div className="pf-emoji">
          <button
            type="button"
            className={`pf-pick${emoji === null ? " on" : ""}`}
            onClick={() => setEmoji(null)}
            title="Use your initials"
          >
            <Avatar name={name} emoji={null} size={30} />
          </button>
          {AVATAR_EMOJI.map((e) => (
            <button
              key={e}
              type="button"
              className={`pf-pick${emoji === e ? " on" : ""}`}
              onClick={() => setEmoji(e)}
              aria-label={`Use ${e}`}
            >
              <span className="pf-e">{e}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-lbl" htmlFor="pf-role">Title</label>
        <input
          id="pf-role" className="pf-in" value={role} maxLength={MAX_ROLE}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Student · Self-taught developer · Aspiring anything"
        />
      </div>

      <div className="pf-row">
        <label className="pf-lbl" htmlFor="pf-goal">Current goal</label>
        <input
          id="pf-goal" className="pf-in" value={goal} maxLength={MAX_GOAL}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Finish the Python track by March"
        />
      </div>

      <div className="pf-row">
        <label className="pf-lbl" htmlFor="pf-bio">About you</label>
        <div style={{ flex: 1, minWidth: 0 }}>
          <textarea
            id="pf-bio" className="pf-in pf-area" value={bio} maxLength={MAX_BIO} rows={3}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A line or two — where you are studying, what you want to build."
          />
          <div className="pf-count">{bio.length}/{MAX_BIO}</div>
        </div>
      </div>

      {/* ---------------------------------------------------------- sharing -- */}
      <div className="pf-sep">Sharing</div>

      <div className="pf-row">
        <label className="pf-lbl" htmlFor="pf-user">Username</label>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            id="pf-user" className="pf-in" value={username} maxLength={20}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="jugendra"
            autoComplete="off" spellCheck={false}
          />
          <div className="pf-count pf-url">
            {slug ? `${host}/u/${slug}` : "Needed only if you want a shareable link."}
          </div>
        </div>
      </div>

      {/* Off unless the student turns it on, and it says in plain words what
          turning it on means. A switch labelled only "public" leaves people
          guessing what becomes visible — so the sentence lists it. */}
      <div className="pf-row">
        <div className="pf-lbl">Public page</div>
        <label className="pf-toggle">
          <input
            type="checkbox" checked={isPublic}
            disabled={!slug}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <span className="pf-sw" aria-hidden />
          <span className="pf-toggle-t">
            {isPublic
              ? "Anyone with the link can see your name, badges, solved counts and activity. Your email is never shown."
              : slug
                ? "Off — only you can see this page."
                : "Pick a username first."}
          </span>
        </label>
      </div>

      {note && <p className="pf-note">{note}</p>}

      <div className="pf-actions">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button className="btn btn-ghost" onClick={() => setOpen(false)} disabled={saving}>Cancel</button>
      </div>
    </div>
  );
}
