import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { asset, profile, sections, ui, type SceneId } from "../data";
import { director } from "../engine/director";
import { frames } from "../engine/frames";
import { useDirector } from "../engine/hooks";
import { clamp, expoInOut, lerp } from "../engine/math";
export function Button({
  children,
  href,
  outline = false,
  to,
  cursor = ui.cursor.go,
}: {
  children: ReactNode;
  href?: string;
  outline?: boolean;
  to?: SceneId;
  cursor?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(pointer:fine)").matches) return;
    const x = gsap.quickTo(el, "x", {
        duration: 0.6,
        ease: "elastic.out(1,.45)",
      }),
      y = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1,.45)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.35);
      y((e.clientY - r.top - r.height / 2) * 0.35);
    };
    const leave = () => {
      x(0);
      y(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      x.tween.kill();
      y.tween.kill();
    };
  }, []);
  return (
    <a
      ref={ref}
      className={`button ${outline ? "outline" : ""}`}
      href={to ? `#${to}` : href}
      data-cursor={cursor}
      download={cursor === ui.cursor.pdf ? true : undefined}
      onClick={
        to
          ? (e) => {
              e.preventDefault();
              director.scrollTo(to);
            }
          : undefined
      }
    >
      <span className="button-fill" />
      <span className="roll-window">
        <span className="roll">
          <span>{children}</span>
          <span aria-hidden="true">{children}</span>
        </span>
      </span>
    </a>
  );
}
export function Chrome() {
  const hud = useRef<HTMLElement>(null),
    load = useRef<HTMLDivElement>(null),
    number = useRef<HTMLOutputElement>(null),
    percent = useRef<HTMLSpanElement>(null),
    rail = useRef<HTMLSpanElement>(null),
    cursor = useRef<HTMLDivElement>(null),
    dot = useRef<HTMLDivElement>(null);
  const progress = useRef(0),
    mouse = useRef({ x: -100, y: -100 }),
    trailing = useRef({ x: -100, y: -100 });
  useEffect(
    () =>
      frames.subscribe(() => {
        if (frames.error && load.current) {
          load.current.querySelector(".loader-bottom")!.textContent =
            ui.loaderError;
          load.current.classList.add("load-error");
        }
      }),
    [],
  );
  useEffect(() => {
    const move = (e: PointerEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      const target = (e.target as Element).closest<HTMLElement>(
        "[data-cursor]",
      );
      if (cursor.current) {
        cursor.current.classList.toggle("hovering", !!target);
        cursor.current.textContent = target?.dataset.cursor ?? "";
      }
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  useDirector((s) => {
    progress.current = lerp(
      progress.current,
      frames.ready ? 100 : clamp(frames.loaded / frames.threshold) * 100,
      0.12,
    );
    if (frames.ready && progress.current > 99.7) {
      progress.current = 100;
      director.markLoaded();
    }
    if (number.current)
      number.current.value = String(Math.floor(progress.current)).padStart(
        3,
        "0",
      );
    if (load.current) {
      const t =
          director.loadReadyAt < 0
            ? 0
            : clamp((s.time - director.loadReadyAt) / 1.2),
        e = expoInOut(t);
      load.current.style.setProperty("--split", `${e * 101}%`);
      load.current.style.setProperty("--line-exit", String(clamp(t * 4)));
      load.current.style.visibility = t >= 1 ? "hidden" : "visible";
      load.current.style.pointerEvents = t >= 1 ? "none" : "all";
    }
    const contact =
      s.active === 6 && (!s.transition.active || s.transition.t > 0.6);
    hud.current?.classList.toggle("on-red", contact);
    hud.current
      ?.querySelectorAll<HTMLAnchorElement>(".nav-link")
      .forEach((el, i) => {
        el.classList.toggle("active", i === s.active);
        if (i === s.active) el.setAttribute("aria-current", "location");
        else el.removeAttribute("aria-current");
      });
    if (percent.current)
      percent.current.textContent = `${Math.round(clamp(s.y / s.total) * 100)}%`;
    if (rail.current)
      rail.current.style.transform = `scaleY(${clamp(s.y / s.total)})`;
    trailing.current.x = lerp(trailing.current.x, mouse.current.x, 0.16);
    trailing.current.y = lerp(trailing.current.y, mouse.current.y, 0.16);
    if (cursor.current)
      cursor.current.style.transform = `translate3d(${trailing.current.x}px,${trailing.current.y}px,0) translate(-50%,-50%)`;
    if (dot.current)
      dot.current.style.transform = `translate3d(${mouse.current.x}px,${mouse.current.y}px,0) translate(-50%,-50%)`;
  });
  return (
    <>
      <header className="hud" ref={hud}>
        <a
          className="logo"
          href="#hero"
          data-cursor={ui.cursor.go}
          onClick={(e) => {
            e.preventDefault();
            director.scrollTo("top");
          }}
        >
          {profile.firstName}
          <sup>®</sup>
        </a>
        <nav className="nav" aria-label="Sections">
          {sections.map((s) => (
            <a
              className="nav-link"
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                director.scrollTo(s.id);
              }}
            >
              {s.label}
            </a>
          ))}
        </nav>
        <div className="global-progress">
          <span ref={percent}>0%</span>
          <span className="progress-track">
            <span ref={rail} />
          </span>
        </div>
      </header>
      <div className="cursor-ring" ref={cursor} aria-hidden="true" />
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
      <div className="preloader" ref={load} aria-label="Loading portfolio">
        <div className="loader-half top" />
        <div className="loader-half bottom" />
        <div className="loader-center">
          <p className="loader-top">{ui.loaderTop}</p>
          <output ref={number}>000</output>
          <p className="loader-bottom">{ui.loaderBottom}</p>
        </div>
      </div>
      <a className="skip-link" href="#contact">
        Skip to contact
      </a>
    </>
  );
}
export const resumeHref = () => asset(profile.resume);
