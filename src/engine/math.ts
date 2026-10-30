export const clamp = (n: number, lo = 0, hi = 1) =>
  Math.max(lo, Math.min(hi, n));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const sine = (t: number) => (1 - Math.cos(Math.PI * clamp(t))) / 2;
export const cubic = (t: number) => 1 - (1 - clamp(t)) ** 3;
export const quart = (t: number) => 1 - (1 - clamp(t)) ** 4;
export const smoothstep = (t: number) => {
  const p = clamp(t);
  return p * p * (3 - 2 * p);
};
export const expoOut = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * clamp(t)));
export const expoInOut = (t: number) =>
  t <= 0
    ? 0
    : t >= 1
      ? 1
      : t < 0.5
        ? 2 ** (20 * t - 10) / 2
        : (2 - 2 ** (-20 * t + 10)) / 2;
export function progress(y: number, top: number, h: number, vh: number) {
  const enter = clamp((y - (top - vh)) / vh),
    p = clamp((y - top) / Math.max(1, h - vh)),
    exit = clamp((y - (top + h - vh)) / vh);
  return { enter, p, exit, vis: clamp(Math.min(enter * 1.6, 1 - exit * 2.2)) };
}
export function frameOrder(count: number, boundaries: number[]) {
  const order = new Set(boundaries);
  for (const step of [8, 4, 2, 1])
    for (let i = 0; i < count; i += step) order.add(i);
  return [...order].filter((i) => i >= 0 && i < count);
}
export function nearestLoaded(
  target: number,
  from: number,
  to: number,
  has: (n: number) => boolean,
) {
  const frame = clamp(Math.round(target), from, to);
  for (let d = 0; d <= to - from; d++) {
    if (frame - d >= from && has(frame - d)) return frame - d;
    if (frame + d <= to && has(frame + d)) return frame + d;
  }
  return null;
}

// Reserve the first 70% of each project slot for reading.
export function deckProgress(p: number, count: number) {
  const raw = clamp(p) * count;
  const i = Math.min(count - 1, Math.floor(raw));
  return Math.min(count - 1, i + smoothstep(clamp(((raw % 1) - 0.7) / 0.3)));
}
export const deckCopyOpacity = (distance: number) =>
  clamp(1 - Math.abs(distance) * 4);
