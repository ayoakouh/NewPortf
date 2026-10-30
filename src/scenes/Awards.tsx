import { useRef } from "react";
import { contributions, counters, ui } from "../data";
import { useDirector, useScene } from "../engine/hooks";
import { clamp, cubic } from "../engine/math";
import { Label, Scene } from "../components/Scene";
import { Odometer } from "../components/Odometer";
export function Awards() {
  const ref = useScene("awards"),
    cards = useRef<HTMLDivElement>(null),
    cylinder = useRef<HTMLDivElement>(null);
  useDirector((s) => {
    const p = s.scenes.awards;
    if (!p) return;
    cards.current
      ?.querySelectorAll<HTMLElement>(".achievement-card")
      .forEach((el, i) => {
        const v = cubic(clamp((p.p * 2.2 + 0.12 - i * 0.12) / 0.35));
        el.style.transform = `perspective(800px) rotateX(${(1 - v) * -100}deg) translateY(${(1 - v) * 35}px)`;
        el.style.opacity = String(v);
      });
    if (cylinder.current)
      cylinder.current.style.transform = `translateZ(-360px) rotateX(-14deg) rotateY(${-p.p * (360 - 360 / contributions.length)}deg)`;
  });
  return (
    <Scene id="awards">
      <div className="awards-copy scene-copy" ref={ref}>
        <Label index={5} />
        <h2 className="awards-title">
          {ui.awardsTitle[0]}
          <br />
          <span className="red">{ui.awardsTitle[1]}</span>
        </h2>
        <div className="achievement-cards" ref={cards}>
          {counters.map((c, i) => (
            <a
              className={`achievement-card ${i % 2 ? "black" : "red-card"}`}
              href={c.href}
              key={c.label}
              data-cursor={ui.cursor.open}
              target={c.href.startsWith("#") ? undefined : "_blank"}
              rel="noreferrer"
            >
              <Odometer
                value={c.value}
                suffix={c.suffix}
                scene="awards"
                start={i * 0.03}
                end={0.55 + i * 0.03}
              />
              <span className="achievement-label">{c.label}</span>
            </a>
          ))}
        </div>
        <p className="cylinder-label">{ui.contributionLabel}</p>
        <div className="cylinder-perspective">
          <div className="cylinder-scale">
            <div className="cylinder" ref={cylinder}>
              {contributions.map((card, i) => (
                <a
                  className="cylinder-card"
                  style={{
                    transform: `rotateY(${(360 / contributions.length) * i}deg) translateZ(360px)`,
                  }}
                  href={card.href}
                  target="_blank"
                  rel="noreferrer"
                  key={card.title}
                  data-cursor={ui.cursor.open}
                >
                  <div
                    className={`cylinder-face ${i % 3 === 2 ? "red-face" : ""}`}
                  >
                    <span className="cylinder-tag">{card.tag}</span>
                    <h3>{card.title}</h3>
                    <span className="cylinder-issuer">{card.issuer}</span>
                    <span className="contribution-seal">{card.seal}</span>
                  </div>
                  <div className="cylinder-back" aria-hidden="true">
                    <span>{card.issuer}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}
