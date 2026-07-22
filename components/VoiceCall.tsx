"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* Voice for a study room, at zero running cost.
 *
 * Audio never reaches our servers: two browsers swap an offer and an answer
 * through the room's existing 2.5s poll, and from then on the sound goes
 * directly between them. No socket server, no media server, no bill.
 *
 * Two decisions that fall out of using a poll as the signalling channel:
 *
 * 1. Non-trickle ICE. Normally a browser dribbles out network candidates as it
 *    finds them, which over a 2.5s poll would mean a dozen round trips and half
 *    a minute to connect. Instead each side waits for gathering to finish and
 *    sends one SDP with every candidate already inside it — two polls, ~5s.
 *
 * 2. A fixed initiator. Whoever has the smaller user id makes the offer. Both
 *    sides see the same member list, so they always agree on who calls whom and
 *    no "glare" handling is needed.
 *
 * STUN only, deliberately: it is free and unlimited, and it is enough for most
 * home and mobile networks. Some strict networks (office/college firewalls,
 * symmetric NAT) need a TURN relay to carry the audio, and that is the one part
 * that can cost money — so instead of paying for it before anyone has asked,
 * this reports the failure honestly rather than sitting there silently dead.
 */

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] },
];
const ICE_GATHER_TIMEOUT_MS = 3000;

export type VoiceMember = { userId: string; name: string; isMe: boolean; inVoice: boolean; micMuted: boolean };
export type VoiceSignal = { from: string; kind: string; payload: string };

type PeerState = "connecting" | "live" | "failed";

/** Waits for the browser to finish finding network candidates, so the SDP we
 *  send already contains them. Bounded — some networks never report complete. */
function waitForIce(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    const finish = () => { pc.removeEventListener("icegatheringstatechange", check); clearTimeout(timer); resolve(); };
    const check = () => { if (pc.iceGatheringState === "complete") finish(); };
    const timer = setTimeout(finish, ICE_GATHER_TIMEOUT_MS);
    pc.addEventListener("icegatheringstatechange", check);
  });
}

export function VoiceCall({
  meId, members, voiceEnabled, voiceLocked, iAmHost, signals, pollSeq, post,
}: {
  meId: string;
  members: VoiceMember[];
  voiceEnabled: boolean;
  /** Closed for everyone during the test phase, not by the host's switch. */
  voiceLocked?: boolean;
  iAmHost: boolean;
  signals: VoiceSignal[];
  pollSeq: number;
  post: (body: Record<string, unknown>) => Promise<unknown>;
}) {
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  // Open mics are what make a five-person room unusable: five keyboards, five
  // fans, five families in the background. The gate mutes YOUR OWN microphone
  // while you are not talking. It cannot mute anyone else's — only their own
  // browser can do that — so this is the honest version of "mute everyone
  // except the speaker" rather than a switch that pretends to reach across.
  const [gate, setGate] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [peerStates, setPeerStates] = useState<Record<string, PeerState>>({});
  const [speaking, setSpeaking] = useState<Record<string, boolean>>({});

  // The raw microphone, and the stream we actually send. They differ because the
  // gate must never silence the microphone itself: a disabled track emits
  // digital silence, the meter would then read nothing, and the gate could never
  // decide you had started talking again. So the meter always listens to the raw
  // mic, and only the gain on the way out is turned down.
  const rawRef = useRef<MediaStream | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [gateReady, setGateReady] = useState(false);
  const localRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const meterRef = useRef<Map<string, { analyser: AnalyserNode; data: Uint8Array }>>(new Map());
  const joinedRef = useRef(false);
  const postRef = useRef(post);
  postRef.current = post;

  const others = members.filter((m) => !m.isMe);
  const inCall = members.filter((m) => m.inVoice);

  /* ---------------------------------------------------------------- audio -- */

  // One shared AudioContext drives every level meter; a context per peer would
  // be several audio threads for a handful of speech streams.
  const meterFor = useCallback((id: string, stream: MediaStream) => {
    try {
      audioCtxRef.current ??= new AudioContext();
      const ctx = audioCtxRef.current;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      meterRef.current.set(id, { analyser, data: new Uint8Array(analyser.fftSize) });
    } catch { /* level meters are decoration; never break the call for them */ }
  }, []);

  const attachRemote = useCallback((id: string, stream: MediaStream) => {
    let el = audioRef.current.get(id);
    if (!el) {
      el = document.createElement("audio");
      el.autoplay = true;
      audioRef.current.set(id, el);
    }
    el.srcObject = stream;
    // Allowed because joining is always a click — browsers block audio that
    // starts without one.
    void el.play().catch(() => {});
    meterFor(id, stream);
  }, [meterFor]);

  const dropPeer = useCallback((id: string) => {
    peersRef.current.get(id)?.close();
    peersRef.current.delete(id);
    const el = audioRef.current.get(id);
    if (el) { el.srcObject = null; audioRef.current.delete(id); }
    meterRef.current.delete(id);
    setPeerStates((p) => { const n = { ...p }; delete n[id]; return n; });
    setSpeaking((p) => { const n = { ...p }; delete n[id]; return n; });
  }, []);

  /* --------------------------------------------------------------- peers --- */

  const newPeer = useCallback((id: string) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const local = localRef.current;
    if (local) local.getTracks().forEach((t) => pc.addTrack(t, local));

    pc.ontrack = (e) => attachRemote(id, e.streams[0]);
    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === "connected") setPeerStates((p) => ({ ...p, [id]: "live" }));
      // "failed" here almost always means both sides are behind strict NAT and
      // the audio needs a relay we do not run. Say so rather than spin forever.
      else if (s === "failed" || s === "closed") setPeerStates((p) => ({ ...p, [id]: "failed" }));
      else setPeerStates((p) => ({ ...p, [id]: p[id] === "live" ? "live" : "connecting" }));
    };
    peersRef.current.set(id, pc);
    setPeerStates((p) => ({ ...p, [id]: "connecting" }));
    return pc;
  }, [attachRemote]);

  const callPeer = useCallback(async (id: string) => {
    const pc = newPeer(id);
    const offer = await pc.createOffer({ offerToReceiveAudio: true });
    await pc.setLocalDescription(offer);
    await waitForIce(pc);
    await postRef.current({ action: "signal", to: id, kind: "offer", payload: pc.localDescription?.sdp ?? "" });
  }, [newPeer]);

  const answerPeer = useCallback(async (id: string, sdp: string) => {
    // If we already had a connection to this peer, their fresh offer means they
    // rebuilt theirs (reload, rejoin) — start clean rather than patch it.
    if (peersRef.current.has(id)) dropPeer(id);
    const pc = newPeer(id);
    await pc.setRemoteDescription({ type: "offer", sdp });
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await waitForIce(pc);
    await postRef.current({ action: "signal", to: id, kind: "answer", payload: pc.localDescription?.sdp ?? "" });
  }, [newPeer, dropPeer]);

  /* ------------------------------------------------------- join and leave -- */

  const hangUp = useCallback(async (tellServer: boolean) => {
    const ids = [...peersRef.current.keys()];
    ids.forEach(dropPeer);
    localRef.current?.getTracks().forEach((t) => t.stop());
    rawRef.current?.getTracks().forEach((t) => t.stop()); // the real mic — the light must go out
    localRef.current = null;
    rawRef.current = null;
    gainRef.current = null;
    meterRef.current.clear();
    joinedRef.current = false;
    setJoined(false);
    setMuted(false);
    setGateReady(false);
    if (tellServer) {
      await Promise.all(ids.map((id) => postRef.current({ action: "signal", to: id, kind: "bye", payload: "" }).catch(() => {})));
      await postRef.current({ action: "voice", on: false }).catch(() => {});
    }
  }, [dropPeer]);

  const join = useCallback(async () => {
    setBusy(true); setError("");
    try {
      const raw = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      });
      rawRef.current = raw;
      localRef.current = raw; // replaced below if the gate graph can be built

      // mic -> analyser (always hears the real signal, gate or no gate)
      //     -> gain -> destination -> what the peers receive
      try {
        audioCtxRef.current ??= new AudioContext();
        const ctx = audioCtxRef.current;
        await ctx.resume().catch(() => {});
        if (ctx.state === "running") {
          const src = ctx.createMediaStreamSource(raw);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 512;
          src.connect(analyser);
          meterRef.current.set(meId, { analyser, data: new Uint8Array(analyser.fftSize) });

          const gain = ctx.createGain();
          gain.gain.value = 1;
          const dest = ctx.createMediaStreamDestination();
          src.connect(gain); gain.connect(dest);
          gainRef.current = gain;
          localRef.current = dest.stream;
          setGateReady(true);
        }
      } catch {
        // No WebAudio, no gate — send the microphone straight through rather
        // than risk sending nothing. Failing open is the only safe direction.
      }
      await postRef.current({ action: "voice", on: true });
      joinedRef.current = true;
      setJoined(true);
    } catch (e) {
      const name = (e as DOMException)?.name ?? "";
      setError(
        name === "NotAllowedError" ? "Microphone permission was blocked. Allow it in your browser's address bar, then try again."
        : name === "NotFoundError" ? "No microphone found on this device."
        : "Could not start the microphone.",
      );
      localRef.current?.getTracks().forEach((t) => t.stop());
      localRef.current = null;
    } finally {
      setBusy(false);
    }
  }, [meId, meterFor]);

  const toggleMute = useCallback(async () => {
    const next = !muted;
    // Applied here as well as in the gate loop, so the button feels instant
    // rather than taking up to a tick to bite.
    const g = gainRef.current;
    if (g) g.gain.setTargetAtTime(next ? 0 : 1, g.context.currentTime, 0.01);
    else rawRef.current?.getAudioTracks().forEach((t) => { t.enabled = !next; });
    setMuted(next);
    await postRef.current({ action: "mic", muted: next }).catch(() => {});
  }, [muted]);

  /* ------------------------------------------------------------- reactions - */

  // Build a connection to everyone already in the call, and tear one down when
  // somebody leaves. Runs off the same poll everything else in the room uses.
  useEffect(() => {
    if (!joined) return;
    const want = new Set(inCall.filter((m) => !m.isMe).map((m) => m.userId));
    for (const id of want) {
      // Only one side calls, so both sides never offer at once.
      if (!peersRef.current.has(id) && meId < id) void callPeer(id);
    }
    for (const id of [...peersRef.current.keys()]) if (!want.has(id)) dropPeer(id);
  }, [joined, pollSeq, inCall, meId, callPeer, dropPeer]);

  // Offers and answers collected by the last poll. The server deletes them as it
  // hands them over, so each one arrives exactly once.
  useEffect(() => {
    if (!joinedRef.current || !signals.length) return;
    (async () => {
      for (const s of signals) {
        try {
          if (s.kind === "offer") await answerPeer(s.from, s.payload);
          else if (s.kind === "answer") await peersRef.current.get(s.from)?.setRemoteDescription({ type: "answer", sdp: s.payload });
          else if (s.kind === "bye") dropPeer(s.from);
        } catch { /* one bad peer must not take down the rest of the call */ }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollSeq]);

  // The host switched voice off while we were in it.
  useEffect(() => {
    if (joined && !voiceEnabled) void hangUp(true);
  }, [voiceEnabled, joined, hangUp]);

  // A reload (or a crash) leaves the server still believing we are in the call,
  // while this page has no microphone and no peers. Everyone else would keep
  // offering to a ghost that can never answer. Clear it once, on the first poll
  // that includes us — after that, `joined` is the truth.
  const reconciledRef = useRef(false);
  useEffect(() => {
    if (reconciledRef.current) return;
    const me = members.find((m) => m.isMe);
    if (!me) return; // no poll has landed yet
    reconciledRef.current = true;
    if (me.inVoice && !joinedRef.current) void postRef.current({ action: "voice", on: false }).catch(() => {});
  }, [members]);

  // Level meters, and the noise gate that rides on them. One timer for
  // everyone, running only while the call is open.
  useEffect(() => {
    if (!joined) return;
    // Loudness as RMS of the waveform, not the average of the frequency bins.
    // The average is a trap: a strong pure tone lights up one bin out of 256 and
    // averages to almost nothing, so a spectrum-average gate stays shut on a
    // signal that is clearly audible. Measured against silence / a quiet tone /
    // a loud tone, RMS reads 0.000 / 0.056 / 0.432 — hence this threshold.
    const SPEAKING = 0.02;
    const HOLD_MS = 700;      // keep the mic open this long after the last peak
    let lastLoud = 0;

    const id = setInterval(() => {
      const next: Record<string, boolean> = {};
      meterRef.current.forEach((m, key) => {
        m.analyser.getByteTimeDomainData(m.data as Uint8Array<ArrayBuffer>);
        let sum = 0;
        for (let i = 0; i < m.data.length; i++) { const v = (m.data[i] - 128) / 128; sum += v * v; }
        next[key] = Math.sqrt(sum / m.data.length) > SPEAKING;
      });
      setSpeaking(next);

      if (next[meId]) lastLoud = Date.now();
      const gateActive = gate && gateReady;
      const open = Date.now() - lastLoud < HOLD_MS;
      setGateOpen(open);
      // Manual mute always wins; the gate only decides while you are unmuted,
      // have asked for it, and it actually works on this browser.
      const shouldSend = !muted && (!gateActive || open);
      const g = gainRef.current;
      if (g) {
        // A short ramp instead of a hard cut — switching gain instantly clicks.
        g.gain.setTargetAtTime(shouldSend ? 1 : 0, g.context.currentTime, 0.02);
      } else {
        rawRef.current?.getAudioTracks().forEach((t) => { t.enabled = shouldSend; });
      }
    }, 150);
    return () => clearInterval(id);
  }, [joined, gate, gateReady, muted, meId]);

  // Hanging up on unmount cannot await a fetch — the page is going away — so it
  // closes the peers locally and lets presence expiry clear the server state.
  useEffect(() => () => {
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    localRef.current?.getTracks().forEach((t) => t.stop());
    void audioCtxRef.current?.close().catch(() => {});
  }, []);

  /* ------------------------------------------------------------------ ui --- */

  const anyFailed = Object.values(peerStates).some((s) => s === "failed");

  if (!voiceEnabled) {
    return (
      <div className="voice off">
        <div className="voice-head"><span>🎙️ Voice</span><span className="voice-tag">{voiceLocked ? "in testing" : "off"}</span></div>
        <p className="voice-note">
          {voiceLocked
            ? "Voice is still being tested, so it only runs in sessions we invite people to. It will open to every room once it is ready."
            : iAmHost ? "You have turned voice off for this room." : "The host has turned voice off for this room."}
        </p>
        {iAmHost && !voiceLocked && (
          <button className="btn btn-ghost" onClick={() => void post({ action: "roomVoice", on: true })}>Turn voice on</button>
        )}
      </div>
    );
  }

  return (
    <div className="voice">
      <div className="voice-head">
        <span>🎙️ Voice</span>
        <span className="voice-tag">{inCall.length ? `${inCall.length} in call` : "nobody yet"}</span>
      </div>

      <div className="voice-people">
        {joined && (
          <div className={`vp in me ${speaking[meId] ? "talking" : ""}`}>
            <span className="vp-dot" />
            <span className="vp-name">You</span>
            <span className={`vp-state ${!muted && (gateOpen || !gateReady) ? "ok" : ""}`}>
              {muted ? "muted"
                : !gateReady ? "mic open"
                : gate ? (gateOpen ? "sending" : "quiet — mic closed")
                : "mic open"}
            </span>
          </div>
        )}
        {others.length === 0 && <p className="voice-note">Nobody else has joined this room yet.</p>}
        {others.map((m) => {
          const state = peerStates[m.userId];
          return (
            <div key={m.userId} className={`vp ${m.inVoice ? "in" : "out"} ${speaking[m.userId] ? "talking" : ""}`}>
              <span className="vp-dot" />
              <span className="vp-name">{m.name}</span>
              {!m.inVoice && <span className="vp-state">not in call</span>}
              {m.inVoice && m.micMuted && <span className="vp-state">muted</span>}
              {m.inVoice && !m.micMuted && joined && state === "connecting" && <span className="vp-state">connecting…</span>}
              {m.inVoice && !m.micMuted && joined && state === "failed" && <span className="vp-state bad">can&apos;t connect</span>}
              {m.inVoice && !m.micMuted && joined && state === "live" && <span className="vp-state ok">live</span>}
            </div>
          );
        })}
      </div>

      {error && <p className="voice-err">{error}</p>}
      {anyFailed && (
        <p className="voice-err">
          Audio could not get through on this network — a college or office firewall usually causes this.
          Try a mobile hotspot.
        </p>
      )}

      <div className="voice-actions">
        {!joined ? (
          <button className="btn btn-primary" disabled={busy} onClick={() => void join()}>
            {busy ? "Starting…" : "Join voice"}
          </button>
        ) : (
          <>
            <button className={`btn ${muted ? "btn-primary" : "btn-ghost"}`} onClick={() => void toggleMute()}>
              {muted ? "🔇 Unmute" : "🎤 Mute"}
            </button>
            {gateReady && (
              <button
                className={`btn btn-ghost ${gate ? "on" : ""}`}
                title="Mutes your own microphone whenever you are not talking, so your keyboard and fan don't reach everyone else. It cannot mute anybody else — only their own browser can do that."
                onClick={() => setGate((g) => !g)}
              >
                {gate ? "🤫 Auto-mute: on" : "🤫 Auto-mute: off"}
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => void hangUp(true)}>Leave voice</button>
          </>
        )}
        {iAmHost && (
          <button className="btn btn-ghost" onClick={() => void post({ action: "roomVoice", on: false })}>Turn off for room</button>
        )}
      </div>

      <p className="voice-note small">
        Peer to peer — audio never touches our servers. Headphones stop the echo.
      </p>
    </div>
  );
}
