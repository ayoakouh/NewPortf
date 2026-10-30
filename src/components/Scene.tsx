import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { sections, ui, type SceneId } from "../data";
export function Scene({ id, children }: { id: SceneId; children: ReactNode }) {
  const info = sections.find((s) => s.id === id)!;
  return (
    <section
      id={id}
      className={`scene scene-${id}`}
      style={{ height: `${info.height}vh` }}
      aria-label={info.label}
    >
      <div className="sticky">
        <div className="scene-inner">{children}</div>
      </div>
    </section>
  );
}
export function Label({ index }: { index: number }) {
  return (
    <p className="section-label">
      <span>({String(index).padStart(2, "0")})</span> — {ui.labels[index]}
    </p>
  );
}
export function Layer({
  front = false,
  children,
}: {
  front?: boolean;
  children: ReactNode;
}) {
  const root = document.getElementById(front ? "layer-front" : "layer-back");
  return root ? createPortal(children, root) : null;
}
