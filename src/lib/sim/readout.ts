export function wobble(base: number, t: number, seed: number, amp: number) {
  return (
    base +
    Math.sin(t * 6.8 + seed) * amp * 0.55 +
    Math.sin(t * 15.2 + seed * 1.4) * amp * 0.45
  );
}

export function liveInt(base: number, t: number, seed: number, amp: number) {
  return Math.round(wobble(base, t, seed, amp));
}

export function liveFixed(base: number, t: number, seed: number, amp: number, digits: number) {
  const f = 10 ** digits;
  return Math.round(wobble(base, t, seed, amp) * f) / f;
}
