import { useRef } from "react";
import { frames, type Shot } from "../engine/frames";
import { SCENES, type Scene } from "../engine/director";
import { useDirector } from "../engine/hooks";
import { clamp } from "../engine/math";
export function Stage() {
  const ref = useRef<HTMLCanvasElement>(null),
    key = useRef("");
  useDirector((s) => {
    const canvas = ref.current;
    if (!canvas || !frames.manifest) return;
    const dpr = Math.min(devicePixelRatio, 2),
      W = s.vw,
      H = s.vh;
    const input = [
      W,
      H,
      dpr,
      s.frame.toFixed(3),
      s.transition.active ? s.transition.t.toFixed(4) : 1,
      s.active,
      s.mouse.x.toFixed(3),
      s.mouse.y.toFixed(3),
      frames.revision,
    ].join("|");
    if (input === key.current) return;
    key.current = input;
    if (
      canvas.width !== Math.round(W * dpr) ||
      canvas.height !== Math.round(H * dpr)
    ) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    function image(f: number, scene: Scene, shift = 0, opacity = 1) {
      if (!ctx) return;
      const shot = frames.shot(Math.floor(f));
      const scale =
        W < 820
          ? Math.min((H * 0.74) / 900, (W * 1.05) / shot.box[2])
          : (H * scene.k) / 900;
      const x = W < 820 ? 0.5 : scene.x;
      const offX =
        x * W - shot.cx * 1600 * scale + (W < 820 ? 0 : s.mouse.x * 14) + shift;
      const offY = H - 900 * scale + (W < 820 ? 0 : s.mouse.y * 7);
      const draw = (frame: number, alpha: number, sh: Shot) => {
        const img = frames.get(frame, sh);
        if (!img) return;
        ctx.globalAlpha = alpha * opacity;
        ctx.drawImage(
          img,
          offX + sh.box[0] * scale,
          offY + sh.box[1] * scale,
          sh.box[2] * scale,
          sh.box[3] * scale,
        );
      };
      const lo = Math.floor(f),
        fraction = f - lo;
      draw(lo, 1, shot);
      if (fraction > 0.001 && lo + 1 <= shot.to) draw(lo + 1, fraction, shot);
      ctx.globalAlpha = 1;
    }
    const tr = s.transition;
    if (!tr.active) {
      image(s.frame, SCENES[s.active]);
      return;
    }
    const { t } = tr,
      skew = 0.2 * H,
      e = -skew + (W + 2 * skew) * t,
      top = e + skew,
      bottom = e - skew;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(top, 0);
    ctx.lineTo(W + skew * 2, 0);
    ctx.lineTo(W + skew * 2, H);
    ctx.lineTo(bottom, H);
    ctx.closePath();
    ctx.clip();
    image(SCENES[tr.outgoing].to, SCENES[tr.outgoing], 60 * t, 1 - 0.35 * t);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-skew * 2, 0);
    ctx.lineTo(top, 0);
    ctx.lineTo(bottom, H);
    ctx.lineTo(-skew * 2, H);
    ctx.closePath();
    ctx.clip();
    image(SCENES[tr.incoming].from, SCENES[tr.incoming], -60 * (1 - t));
    ctx.restore();
    const color = tr.incoming === 6 ? "255,255,255" : "255,31,31";
    ctx.save();
    ctx.transform(1, 0, (-2 * skew) / H, 1, top, 0);
    const gradient = ctx.createLinearGradient(-90, 0, 0, 0);
    gradient.addColorStop(0, `rgba(${color},0)`);
    gradient.addColorStop(1, `rgba(${color},.24)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(-90, 0, 90, H);
    ctx.shadowColor = `rgb(${color})`;
    ctx.shadowBlur = 24;
    ctx.fillStyle = `rgb(${color})`;
    ctx.fillRect(-1.5, 0, 3, H);
    ctx.restore();
  });
  return <canvas className="stage" ref={ref} aria-hidden="true" />;
}
