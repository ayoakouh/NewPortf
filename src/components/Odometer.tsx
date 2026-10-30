import { useRef } from "react";
import { useDirector } from "../engine/hooks";
import { clamp, smoothstep } from "../engine/math";
import type { SceneId } from "../data";
export function Odometer({
  value,
  display,
  suffix = "",
  scene = "about",
  start = 0,
  end = 0.75,
}: {
  value: number | null;
  display?: string;
  suffix?: string;
  scene?: SceneId;
  start?: number;
  end?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const text = display ?? String(value ?? "N/A");
  useDirector((s) => {
    const el = ref.current,
      p = s.scenes[scene];
    if (!el || !p || value === null) return;
    const progress = clamp((p.p - start) / (end - start));
    const running = value * progress;
    const strips = el.querySelectorAll<HTMLElement>(".digit-strip");
    strips.forEach((strip, index) => {
      const power = 10 ** (strips.length - index - 1);
      const raw = running / power;
      const digit = Math.floor(raw) % 10;
      const remainder = (running % power) / power;
      let carry =
        index === strips.length - 1
          ? smoothstep(((raw % 1) - 0.55) / 0.45)
          : smoothstep((remainder - 0.85) / 0.15);
      if (progress >= 1) carry = 0;
      strip.style.transform = `translateY(-${((digit + carry) / 11) * 100}%)`;
    });
  });
  return (
    <span className="odometer" ref={ref} aria-label={`${text}${suffix}`}>
      <span className="sr-only">
        {text}
        {suffix}
      </span>
      <span aria-hidden="true" className="odometer-digits">
        {[...text].map((char, i) =>
          /\d/.test(char) ? (
            <span className="digit-window" key={i}>
              <span className="digit-strip">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, j) => (
                  <span key={j}>{d}</span>
                ))}
              </span>
            </span>
          ) : (
            <span key={i}>{char}</span>
          ),
        )}
        {suffix && <span className="odometer-suffix">{suffix}</span>}
      </span>
    </span>
  );
}
