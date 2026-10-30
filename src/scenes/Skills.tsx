import { useRef } from "react";
import { skills, ui } from "../data";
import { useDirector, useScene } from "../engine/hooks";
import { Layer, Label, Scene } from "../components/Scene";
import { clamp } from "../engine/math";
const points = skills.map((_, i) => {
  const y = 1 - ((i + 0.5) / skills.length) * 2,
    r = Math.sqrt(1 - y * y),
    theta = Math.PI * (3 - Math.sqrt(5)) * i;
  return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
});
export function Skills() {
  const ref = useScene("skills"),
    back = useRef<HTMLDivElement>(null),
    front = useRef<HTMLDivElement>(null),
    tape = useRef<HTMLDivElement>(null);
  useDirector((s) => {
    const p = s.scenes.skills;
    if (!p) return;
    const spin = s.time * 0.12 + p.p * 5 + s.mouse.x * 0.15,
      tilt = -0.28 + s.mouse.y * 0.08,
      R = Math.min(s.vw * 0.27, s.vh * 0.46) * (s.vw < 820 ? 1.35 : 1);
    for (const [container, isFront] of [
      [back.current, false],
      [front.current, true],
    ] as const) {
      if (!container) continue;
      container.style.opacity = String(
        s.ready ? p.vis * Math.max(0, 1 - p.exit * 2.4) : 0,
      );
      container.style.visibility = p.vis > 0.001 ? "visible" : "hidden";
      container
        .querySelectorAll<HTMLElement>(".orbit-chip")
        .forEach((el, i) => {
          const pt = points[i],
            x = pt.x * Math.cos(spin) + pt.z * Math.sin(spin),
            z = -pt.x * Math.sin(spin) + pt.z * Math.cos(spin),
            y = pt.y * Math.cos(tilt) - z * Math.sin(tilt),
            depth = pt.y * Math.sin(tilt) + z * Math.cos(tilt);
          const show = isFront ? depth >= 0 : depth < 0;
          el.style.visibility = show && p.vis > 0.001 ? "visible" : "hidden";
          el.style.transform = `translate3d(${s.vw * 0.5 + x * R}px,${s.vh * 0.53 + y * R * 0.78}px,0) translate(-50%,-50%) scale(${0.86 + 0.18 * (depth + 1)})`;
          el.style.opacity = String(clamp(0.5 + (0.5 * (depth + 1)) / 2));
        });
    }
    if (tape.current)
      tape.current.style.transform = `translateX(${-p.p * 750}px)`;
  });
  const chips = (front: boolean) =>
    skills.map((skill) => (
      <span
        key={skill}
        className={`orbit-chip ${front ? "front-chip" : "back-chip"}`}
      >
        {skill}
      </span>
    ));
  return (
    <Scene id="skills">
      <Layer>
        <div ref={back} className="orbit-layer">
          {chips(false)}
        </div>
      </Layer>
      <Layer front>
        <div ref={front} className="orbit-layer">
          {chips(true)}
        </div>
      </Layer>
      <div className="skills-copy scene-copy" ref={ref}>
        <div className="skills-heading">
          <Label index={4} />
          <h2 className="section-title">
            {ui.skillsTitle[0]}
            <br />
            <span className="red">{ui.skillsTitle[1]}</span>
          </h2>
        </div>
        <div className="marquee">
          <div ref={tape}>
            {[...skills, ...skills].map((skill, i) => (
              <span key={i}>
                {skill} <b>✦</b>{" "}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}
