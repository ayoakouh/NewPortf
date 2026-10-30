import { useRef } from "react";
import { asset, profile, ui } from "../data";
import { useDirector, useScene } from "../engine/hooks";
import { SCENES, director } from "../engine/director";
import { clamp, cubic } from "../engine/math";
import { Layer, Scene } from "../components/Scene";
export function Contact() {
  const ref = useScene("contact"),
    bg = useRef<HTMLDivElement>(null),
    title = useRef<HTMLHeadingElement>(null);
  useDirector((s) => {
    const scene = SCENES[6];
    if (!scene) return;
    const entering = s.active === 6,
      transition = entering && s.transition.active,
      t = entering ? (transition ? s.transition.t : 1) : 0,
      skew = 0.2 * s.vh,
      e = -skew + (s.vw + 2 * skew) * t;
    if (bg.current) {
      bg.current.style.visibility = entering ? "visible" : "hidden";
      bg.current.style.clipPath = `polygon(0 0, ${e + skew}px 0, ${e - skew}px 100%, 0 100%)`;
    }
    if (title.current) {
      const v = cubic(clamp((t - 0.15) / 0.7));
      title.current.style.opacity = String(s.ready ? v : 0);
      title.current.style.transform = `translateY(${(1 - v) * 70}px)`;
    }
  });
  const links = [
    { label: ui.links[0], href: profile.github },
    { label: ui.links[1], href: profile.linkedin },
    { label: ui.links[2], href: asset(profile.resume) },
  ];
  return (
    <Scene id="contact">
      <Layer>
        <div className="contact-background" ref={bg}>
          <h2 className="contact-title" ref={title}>
            {ui.contactTitle[0]}
            <br />
            {ui.contactTitle[1]}
          </h2>
        </div>
      </Layer>
      <div className="contact-copy scene-copy" ref={ref}>
        <a
          className="email"
          href={`mailto:${profile.email}`}
          data-cursor={ui.cursor.write}
        >
          <span>{profile.emailName}</span>
          <span className="email-domain">{profile.emailDomain}</span>
        </a>
        <div className="contact-links">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.label === "Résumé" ? undefined : "_blank"}
              rel="noreferrer"
              download={l.label === "Résumé" ? true : undefined}
              data-cursor={
                l.label === "Résumé" ? ui.cursor.pdf : ui.cursor.open
              }
            >
              {l.label}
              <span>↗</span>
            </a>
          ))}
        </div>
        <footer>
          <span>
            © {profile.copyrightYear} {profile.name}
          </span>
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              director.scrollTo("top");
            }}
            data-cursor={ui.cursor.go}
          >
            {ui.backTop}
          </a>
        </footer>
      </div>
    </Scene>
  );
}
