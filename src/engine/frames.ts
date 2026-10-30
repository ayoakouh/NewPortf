import { asset } from "../data";
import { frameOrder, nearestLoaded } from "./math";
export type Shot = {
  from: number;
  to: number;
  box: [number, number, number, number];
  cx: number;
};
export type Manifest = { w: 1600; h: 900; count: number; shots: Shot[] };
export class FrameLoader {
  manifest!: Manifest;
  images = new Map<number, HTMLImageElement>();
  revision = 0;
  failed = new Set<number>();
  listeners = new Set<() => void>();
  onManifest?: (m: Manifest) => void;
  error = "";
  settled = 0;
  done = false;
  get loaded() {
    return this.images.size;
  }
  get threshold() {
    return this.manifest ? Math.ceil(this.manifest.count / 4) : 1;
  }
  get ready() {
    return (
      !!this.manifest &&
      this.manifest.shots.every((shot) =>
        [...this.images.keys()].some((n) => n >= shot.from && n <= shot.to),
      ) &&
      (this.loaded >= this.threshold || (this.done && this.loaded > 0))
    );
  }
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  notify() {
    for (const fn of this.listeners) fn();
  }
  async init() {
    try {
      const res = await fetch(asset("frames/manifest.json"));
      if (!res.ok) throw Error("Frame manifest unavailable");
      const m = (await res.json()) as Manifest;
      if (
        m.w !== 1600 ||
        m.h !== 900 ||
        m.count < 4 ||
        m.shots.length !== 4 ||
        m.shots.some(
          (s, i) =>
            s.from !== (i ? m.shots[i - 1].to + 1 : 0) ||
            s.to < s.from ||
            s.box.length !== 4 ||
            s.cx < 0 ||
            s.cx > 1,
        ) ||
        m.shots[3].to !== m.count - 1
      )
        throw Error("Invalid frame manifest");
      this.manifest = m;
      this.onManifest?.(m);
      this.notify();
      const variant = innerWidth < 820 ? "sm" : "lg";
      const order = frameOrder(
        m.count,
        m.shots.flatMap((s) => [s.from, s.to]),
      );
      let cursor = 0;
      const worker = async () => {
        while (cursor < order.length) {
          const n = order[cursor++];
          try {
            const image = new Image();
            image.decoding = "async";
            image.src = asset(
              `frames/${variant}/f${String(n).padStart(3, "0")}.webp`,
            );
            await image.decode();
            this.images.set(n, image);
            this.revision++;
          } catch {
            this.failed.add(n);
          }
          this.settled++;
          this.notify();
        }
      };
      await Promise.all(Array.from({ length: 6 }, worker));
      this.done = true;
      if (!this.loaded) this.error = "No animation frames could be loaded";
      else if (!this.ready)
        this.error = "One or more animation shots could not be loaded";
      this.notify();
    } catch (e) {
      this.error = e instanceof Error ? e.message : "Loading failed";
      this.done = true;
      this.notify();
    }
  }
  shot(frame: number) {
    return (
      this.manifest.shots.find((s) => frame >= s.from && frame <= s.to) ||
      this.manifest.shots[0]
    );
  }
  get(frame: number, shot: Shot) {
    const n = nearestLoaded(frame, shot.from, shot.to, (n) =>
      this.images.has(n),
    );
    return n === null ? null : this.images.get(n)!;
  }
}
export const frames = new FrameLoader();
