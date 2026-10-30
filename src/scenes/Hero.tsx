import { useRef } from "react";
import { profile, ui } from "../data";
import { useDirector, useScene } from "../engine/hooks";
import { clamp, expoOut } from "../engine/math";
import { Layer, Scene } from "../components/Scene";
import { Button, resumeHref } from "../components/Chrome";
export function Hero() {
  const ref = useScene("hero"),
    name = useRef<HTMLDivElement>(null),
    underline = useRef<HTMLSpanElement>(null),
    title = useRef<HTMLHeadingElement>(null);
  useDirector((s) => {
    const p = s.scenes.hero;
    if (!p) return;
    name.current
      ?.querySelectorAll<HTMLElement>(".hero-letter")
      .forEach((el, i) => {
        const t = expoOut(clamp((s.intro - i * 0.07) / 1.6));
        el.style.transform = `translateY(${(1 - t) * 115 + Math.sin(i) * p.p * 12}%) rotateX(${(1 - t) * -80}deg)`;
      });
    if (name.current)
      name.current.style.opacity = String(
        s.ready ? Math.max(0, 1 - p.exit * 2.4) : 0,
      );
    title.current
      ?.querySelectorAll<HTMLElement>(".title-line>span")
      .forEach((el, i) => {
        const t = expoOut(clamp((s.intro - 0.15 - i * 0.12) / 1.6));
        el.style.transform = `translateY(${(1 - t) * 115}%)`;
      });
    if (underline.current)
      underline.current.style.transform = `scaleX(${clamp(0.08 + p.p * 1.6)})`;
  });
  return (
    <Scene id="hero">
      <Layer>
        <div className="hero-name" ref={name} aria-hidden="true">
          {[...profile.firstName].map((l, i) => (
            <span className="letter-mask" key={i}>
              <span className="hero-letter">{l}</span>
            </span>
          ))}
        </div>
      </Layer>
      <div ref={ref} className="hero-copy scene-copy">
        <p className="greeting">
          {profile.greeting} <span>{profile.name}</span> {profile.greetingEnd}
        </p>
        <h1 ref={title}>
          {profile.title.map((line, i) => (
            <span className={`title-line ${i ? "red" : ""}`} key={line}>
              <span>{line}</span>
            </span>
          ))}
        </h1>
        <p className="tagline">
          {profile.tagline.map((line, i) => (
            <span key={line}>
              {line}
              {i === 0 && <span className="highlighter" ref={underline} />}
            </span>
          ))}
        </p>
        <div className="hero-buttons">
          <Button to="work">{ui.workButton}</Button>
          <Button href={resumeHref()} outline cursor={ui.cursor.pdf}>
            {ui.resumeButton}
          </Button>
        </div>
      </div>
    </Scene>
  );
}
