import { useRef } from "react";
import { profile, stats } from "../data";
import { useDirector, useScene } from "../engine/hooks";
import { clamp, cubic } from "../engine/math";
import { Layer, Label, Scene } from "../components/Scene";
import { TiltCard } from "../components/TiltCard";
import { Odometer } from "../components/Odometer";
export function About() {
  const ref = useScene("about"),
    wash = useRef<HTMLDivElement>(null),
    words = useRef<HTMLParagraphElement>(null);
  useDirector((s) => {
    const p = s.scenes.about;
    if (!p) return;
    if (wash.current) {
      wash.current.style.opacity = String(s.ready ? p.vis : 0);
      wash.current.style.transform = `translateX(${(1 - cubic(p.enter)) * -100}px)`;
    }
    const all = words.current?.querySelectorAll<HTMLElement>(".word");
    all?.forEach((el, i) => {
      const v = cubic(
        clamp((p.p * 0.9 + 0.08 - (i / (all.length || 1)) * 0.72) / 0.16),
      );
      el.style.opacity = String(0.1 + 0.9 * v);
      el.style.transform = `translateY(${(1 - v) * 0.25}em)`;
      el.style.filter = `blur(${(1 - v) * 4}px)`;
    });
  });
  return (
    <Scene id="about">
      <Layer>
        <div className="about-wash" ref={wash} />
      </Layer>
      <div className="about-copy scene-copy" ref={ref}>
        <div>
          <Label index={1} />
          <p className="manifesto" ref={words}>
            {profile.manifesto.split(" ").map((w, i) => (
              <span
                className={`word ${profile.keywords.includes(w) ? "red" : ""}`}
                key={i}
              >
                {w}{" "}
              </span>
            ))}
          </p>
        </div>
        <div className="stats">
          {stats.map((stat) => (
            <TiltCard key={stat.label}>
              <Odometer value={stat.value} display={stat.display} />
              <span className="stat-label">{stat.label}</span>
            </TiltCard>
          ))}
        </div>
      </div>
    </Scene>
  );
}
