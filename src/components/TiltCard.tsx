import { useRef, type ReactNode } from "react";
import { useDirector } from "../engine/hooks";
import { lerp } from "../engine/math";
export function TiltCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null),
    target = useRef({ x: 0, y: 0 }),
    current = useRef({ x: 0, y: 0 });
  useDirector(() => {
    const el = ref.current;
    if (!el) return;
    current.current.x = lerp(current.current.x, target.current.x, 0.12);
    current.current.y = lerp(current.current.y, target.current.y, 0.12);
    el.style.transform = `perspective(700px) rotateX(${-current.current.y * 14}deg) rotateY(${current.current.x * 14}deg)`;
  });
  return (
    <div
      className="tilt-card"
      ref={ref}
      onPointerMove={(e) => {
        if (matchMedia("(pointer:coarse)").matches) return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width,
          y = (e.clientY - r.top) / r.height;
        target.current = { x: (x - 0.5) * 2, y: (y - 0.5) * 2 };
        e.currentTarget.style.setProperty("--glare-x", `${x * 100}%`);
        e.currentTarget.style.setProperty("--glare-y", `${y * 100}%`);
      }}
      onPointerLeave={() => {
        target.current = { x: 0, y: 0 };
      }}
    >
      {children}
      <span className="glare" />
    </div>
  );
}
