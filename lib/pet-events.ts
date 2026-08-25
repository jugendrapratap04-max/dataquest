/*
 * The pet's event bus.
 *
 * Byte's body (BytePet) and Byte's voice (EtudoBuddy) are two components that
 * sit in different parts of the layout and must not import each other — the pet
 * has to stay free of anything that costs an API call, and the chat has to stay
 * usable on screens where the pet is not rendered at all.
 *
 * A window CustomEvent keeps them apart. The pet announces what happened to it;
 * whoever cares listens. Neither one holds a reference to the other, and adding
 * a third listener later costs nothing.
 *
 * This is deliberately not React Context: the two ends are far apart in the
 * tree, the payloads are one-shot rather than state, and a provider wrapping the
 * whole app would re-render it on every pet twitch.
 */

/*
 * Every event the pet can announce or be told about.
 *
 * `pet:cue` carries one of lib/sound.ts's study cues. Hooking the pet to the
 * SOUND bus rather than to the workbenches is what keeps this cheap: fifteen
 * call sites across six components already fire those cues, and not one of them
 * has to learn that a pet exists.
 *
 * `pet:thinking` is a boolean — the chat raising and lowering its hand while it
 * waits on an answer.
 */
export type PetEventName =
  | "pet:open-chat"
  | "pet:cue"
  | "pet:thinking";

/*
 * Tell everyone the pet did something.
 *
 * Safe to call during render paths that also run on the server: without a
 * window there is nobody listening anyway.
 */
export function emitPetEvent(
  name: PetEventName,
  detail?: unknown
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(name, { detail })
  );
}

/*
 * Listen for one of the pet's events.
 *
 * Returns the unsubscribe function, so an effect can hand it straight back:
 *
 *   useEffect(() => onPetEvent("pet:open-chat", () => setOpen(true)), []);
 */
export function onPetEvent(
  name: PetEventName,
  handler: (detail: unknown) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = (event: Event) => {
    handler((event as CustomEvent).detail);
  };

  window.addEventListener(name, listener);

  return () => {
    window.removeEventListener(name, listener);
  };
}
