import { useRef } from "react";
import { projects, ui } from "../data";
import { useDirector, useScene } from "../engine/hooks";
import { clamp, cubic, deckProgress, deckCopyOpacity } from "../engine/math";
import { Layer, Label, Scene } from "../components/Scene";
export function Work() {
  const ref = useScene("work"),
    floor = useRef<HTMLDivElement>(null),
    deck = useRef<HTMLDivElement>(null),
    counter = useRef<HTMLSpanElement>(null),
    bar = useRef<HTMLSpanElement>(null);
  useDirector((s) => {
    const p = s.scenes.work;
    if (!p) return;
    if (floor.current) {
      floor.current.style.opacity = String(s.ready ? p.vis : 0);
      floor.current.style.backgroundPosition = `0 ${p.p * 360}px`;
    }
    const q = deckProgress(p.p, projects.length);
    deck.current
      ?.querySelectorAll<HTMLElement>(".project-card")
      .forEach((el, i) => {
        const d = q - i;
        const entry = 1 - cubic(clamp((p.enter - 0.1) / 0.9));
        const z = d > 0 ? d * 900 : d * 300,
          y = d > 0 ? -12 * d : d * 3.2;
        const alpha =
          d > 0 ? clamp(1 - 1.8 * d) : clamp(1 + Math.min(0, d + 1));
        el.style.transform = `translate3d(0,${y + entry * 70}vh,${z}px) rotateX(${d > 0 ? 28 * d : 0}deg) rotateY(${-25 * entry}deg)`;
        el.style.opacity = String(alpha);
        const info = el.querySelector<HTMLElement>(".project-info");
        if (info) info.style.opacity = String(deckCopyOpacity(d));
        el.style.visibility = alpha > 0.001 ? "visible" : "hidden";
        el.style.pointerEvents = Math.abs(d) < 0.25 ? "auto" : "none";
        el.setAttribute("aria-hidden", Math.abs(d) >= 0.25 ? "true" : "false");
        el.querySelectorAll("a").forEach(
          (a) => (a.tabIndex = Math.abs(d) < 0.25 ? 0 : -1),
        );
      });
    if (counter.current)
      counter.current.textContent = `0${Math.min(3, Math.round(q) + 1)} / 03`;
    if (bar.current) bar.current.style.transform = `scaleX(${(q + 1) / 3})`;
    floor.current?.style.setProperty("--gauge", `${Math.round(40 + p.p * 60)}`);
    deck.current?.style.setProperty("--mock-motion", `${(s.time * 16) % 100}%`);
    deck.current?.style.setProperty(
      "--gauge-angle",
      `${s.time * 30 + p.p * 180}deg`,
    );
  });
  return (
    <Scene id="work">
      <Layer>
        <div className="work-floor" ref={floor} />
      </Layer>
      <div className="work-copy scene-copy" ref={ref}>
        <div className="work-header">
          <Label index={2} />
          <div className="work-meter">
            <span ref={counter}>01 / 03</span>
            <span className="work-bar">
              <span ref={bar} />
            </span>
          </div>
        </div>
        <div className="deck-window">
          <div className="project-deck" ref={deck}>
            {projects.map((p, i) => (
              <article className="project-card" key={p.name}>
                <div className="project-info">
                  <p className="project-category">
                    <span>0{i + 1}</span> / {p.category}
                  </p>
                  <h2>{p.name}</h2>
                  <p className="project-description">{p.description}</p>
                  <div className="tech-chips">
                    {p.chips.map((c) => (
                      <span key={c}>{c}</span>
                    ))}
                  </div>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    className="project-link"
                    data-cursor={ui.cursor.open}
                  >
                    {ui.projectLink}
                  </a>
                </div>
                <div
                  className={`project-visual ${p.visual}`}
                  aria-hidden="true"
                >
                  <div className="mock-top">
                    <span>{p.mockLabel}</span>
                    <i />
                  </div>
                  {p.visual === "server" ? (
                    <div className="server-mock">
                      <div className="gauge">
                        <span>{p.mockStatus}</span>
                      </div>
                      <div className="server-lines">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} style={{ width: `${45 + i * 9}%` }} />
                        ))}
                      </div>
                    </div>
                  ) : p.visual === "chat" ? (
                    <div className="chat-mock">
                      {ui.mockMessages.map((t, i) => (
                        <div key={t} className={i % 2 ? "reply" : ""}>
                          {t}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="containers-mock">
                      {ui.mockServices.map((t, i) => (
                        <div key={t}>
                          <span>0{i + 1}</span>
                          <strong>{t}</strong>
                          <i />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mock-bottom">
                    <i />
                    {p.mockStatus}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}
