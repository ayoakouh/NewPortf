import { useEffect, useRef } from "react";
import { director, type Snapshot } from "./director";
import { clamp, cubic } from "./math";
import type { SceneId } from "../data";
export function useDirector(fn: (state: Snapshot) => void) {
  const cb = useRef(fn);
  cb.current = fn;
  useEffect(() => director.subscribe((s) => cb.current(s)), []);
}
export function useScene(id: SceneId) {
  const ref = useRef<HTMLDivElement>(null);
  useDirector((s) => {
    const el = ref.current,
      scene = s.scenes[id];
    if (!el || !scene) return;
    const enter = cubic(clamp((scene.enter - 0.12) / 0.65));
    const alpha = enter * Math.max(0, 1 - scene.exit * 2.4);
    el.style.opacity = String(s.ready ? alpha : 0);
    el.style.transform = `translate3d(0,${(1 - enter) * 55 - scene.exit * 30}px,0)`;
    el.style.visibility = alpha > 0.001 ? "visible" : "hidden";
  });
  return ref;
}
