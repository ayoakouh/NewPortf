import gsap from "gsap";
import Lenis from "lenis";
import { sections, type SceneId } from "../data";
import type { Manifest } from "./frames";
import { clamp, lerp, progress, quart, sine } from "./math";
export type Scene = (typeof sections)[number] & {
  from: number;
  to: number;
  top: number;
  h: number;
};
export type SceneState = ReturnType<typeof progress>;
export type Snapshot = {
  y: number;
  vh: number;
  vw: number;
  time: number;
  mouse: { x: number; y: number };
  scenes: Record<SceneId, SceneState>;
  active: number;
  frame: number;
  transition: {
    active: boolean;
    t: number;
    incoming: number;
    outgoing: number;
  };
  intro: number;
  ready: boolean;
  total: number;
};
export let SCENES: Scene[] = [];
class Director {
  lenis: Lenis | null = null;
  listeners = new Set<(s: Snapshot) => void>();
  observer?: ResizeObserver;
  introAt = -1;
  loadReadyAt = -1;
  started = false;
  state: Snapshot = {
    y: 0,
    vh: innerHeight,
    vw: innerWidth,
    time: 0,
    mouse: { x: 0, y: 0 },
    scenes: {} as Record<SceneId, SceneState>,
    active: 0,
    frame: 0,
    transition: { active: false, t: 1, incoming: 0, outgoing: 0 },
    intro: 0,
    ready: false,
    total: 1,
  };
  targetMouse = { x: 0, y: 0 };
  init(m: Manifest) {
    const [s1, s2, s3, s4] = m.shots;
    const length = s4.to - s4.from + 1;
    const b1 = s4.from + Math.floor(length * 0.6),
      b2 = s4.from + Math.floor(length * 0.85);
    const ranges = [
      [s1.from, s1.to],
      [s2.from, s2.to],
      [s3.from, s3.to],
      [s4.from, b1 - 1],
      [b1, b2 - 1],
      [b2, s4.to],
      [s1.to, s1.from],
    ];
    SCENES = sections.map((s, i) => ({
      ...s,
      from: ranges[i][0],
      to: ranges[i][1],
      top: 0,
      h: 0,
    }));
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    this.lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      autoRaf: false,
    });
    this.lenis.stop();
    this.measure();
    this.observer = new ResizeObserver(() => this.measure());
    for (const s of SCENES) {
      const el = document.getElementById(s.id);
      if (el) this.observer.observe(el);
    }
    window.addEventListener("resize", this.measure);
    window.addEventListener("pointermove", this.pointer);
    gsap.ticker.lagSmoothing(0);
    gsap.ticker.add(this.tick);
    this.started = true;
  }
  measure = () => {
    this.state.vh = innerHeight;
    this.state.vw = innerWidth;
    for (const s of SCENES) {
      const el = document.getElementById(s.id);
      if (el) {
        s.top = el.getBoundingClientRect().top + window.scrollY;
        s.h = el.offsetHeight;
      }
    }
    this.state.total = Math.max(
      1,
      document.documentElement.scrollHeight - innerHeight,
    );
    this.lenis?.resize();
  };
  pointer = (e: PointerEvent) => {
    this.targetMouse = {
      x: (e.clientX / innerWidth) * 2 - 1,
      y: (e.clientY / innerHeight) * 2 - 1,
    };
  };
  markLoaded() {
    if (this.loadReadyAt < 0) this.loadReadyAt = this.state.time;
  }
  subscribe = (fn: (s: Snapshot) => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  tick = (time: number) => {
    this.state.time = time;
    this.lenis?.raf(time * 1000);
    if (
      this.loadReadyAt >= 0 &&
      this.introAt < 0 &&
      time - this.loadReadyAt >= 1.2
    ) {
      this.introAt = time;
      this.state.ready = true;
      document.documentElement.dataset.ready = "true";
      this.lenis?.start();
      window.dispatchEvent(new Event("portfolio:intro"));
    }
    this.state.intro = this.introAt < 0 ? 0 : Math.max(0, time - this.introAt);
    const y = this.lenis?.scroll ?? window.scrollY;
    this.state.y = y;
    this.state.mouse.x = lerp(this.state.mouse.x, this.targetMouse.x, 0.06);
    this.state.mouse.y = lerp(this.state.mouse.y, this.targetMouse.y, 0.06);
    let active = 0;
    for (let i = 0; i < SCENES.length; i++) {
      const s = SCENES[i];
      this.state.scenes[s.id] = progress(y, s.top, s.h, this.state.vh);
      if (y >= s.top - 0.78 * this.state.vh) active = i;
    }
    const scene = SCENES[active];
    if (!scene) return;
    this.state.active = active;
    const p = this.state.scenes[scene.id].p;
    this.state.frame = scene.from + (scene.to - scene.from) * p;
    const t = sine(
      clamp((y - (scene.top - 0.78 * this.state.vh)) / (0.62 * this.state.vh)),
    );
    this.state.transition = {
      active: active > 0 && t < 1,
      t,
      incoming: active,
      outgoing: Math.max(0, active - 1),
    };
    for (const fn of this.listeners) fn(this.state);
  };
  scrollTo(id: SceneId | "top") {
    this.lenis?.scrollTo(id === "top" ? 0 : document.getElementById(id)!, {
      duration: 2.2,
      easing: quart,
    });
  }
  seek(y: number) {
    this.lenis?.scrollTo(y, { immediate: true, force: true });
  }
  destroy() {
    gsap.ticker.remove(this.tick);
    this.lenis?.destroy();
    this.observer?.disconnect();
    window.removeEventListener("resize", this.measure);
    window.removeEventListener("pointermove", this.pointer);
    this.started = false;
  }
}
export const director = new Director();
declare global {
  interface Window {
    __portfolio: {
      seek: (y: number) => void;
      geometry: () => { id: SceneId; top: number; h: number }[];
      snapshot: () => Snapshot;
      loaded: () => number;
    };
  }
}
