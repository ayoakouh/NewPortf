import { useRef } from "react";
import { journey, ui } from "../data";
import { useDirector, useScene } from "../engine/hooks";
import { clamp, cubic } from "../engine/math";
import { Layer, Label, Scene } from "../components/Scene";
export function Journey() {
  const ref = useScene("journey"),
    year = useRef<HTMLDivElement>(null),
    items = useRef<HTMLDivElement>(null),
    path = useRef<SVGPathElement>(null);
  useDirector((s) => {
    const p = s.scenes.journey;
    if (!p) return;
    if (year.current) {
      year.current.style.opacity = String(s.ready ? p.vis : 0);
      const strip = year.current.querySelector<HTMLElement>(".year-strip");
      if (strip)
        strip.style.transform = `translateY(${((-clamp(p.p) * 2) / 3) * 100}%)`;
    }
    if (path.current)
      path.current.style.strokeDashoffset = String(1 - clamp(p.p * 1.5));
    items.current
      ?.querySelectorAll<HTMLElement>(".timeline-item")
      .forEach((el, i) => {
        const t = cubic(clamp((p.p * 1.3 - (2 - i) * 0.2 + 0.12) / 0.28));
        el.style.opacity = String(t);
        el.style.transform = `perspective(900px) translateY(${(1 - t) * 24}px) rotateY(${(1 - t) * -55}deg)`;
        el.classList.toggle("lit", t > 0.65);
      });
  });
  return (
    <Scene id="journey">
      <Layer>
        <div className="journey-year" ref={year} aria-hidden="true">
          <div className="year-strip">
            {["2024", "2025", "2026"].map((y) => (
              <span key={y}>{y}</span>
            ))}
          </div>
        </div>
      </Layer>
      <div className="journey-copy scene-copy" ref={ref}>
        <Label index={3} />
        <h2 className="section-title">
          {ui.journeyTitle[0]}
          <br />
          <span className="red">{ui.journeyTitle[1]}</span>
        </h2>
        <div className="timeline" ref={items}>
          <div className="timeline-track">
            <svg
              viewBox="0 0 4 300"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M2 300 L2 0" pathLength="1" ref={path} />
            </svg>
          </div>
          {journey.map((item) => (
            <a
              className="timeline-item"
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              data-cursor={ui.cursor.open}
            >
              <span className="timeline-node" />
              <span className="timeline-date">{item.year}</span>
              <h3>{item.title}</h3>
              <p>{item.organisation}</p>
            </a>
          ))}
        </div>
      </div>
    </Scene>
  );
}
