"use client";

import { useRef, type PointerEvent } from "react";

const W = 600;
const H = 180;

// Draws on a canvas and copies the PNG into a hidden "signature" field on every stroke.
export function SignaturePad() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const hidden = useRef<HTMLInputElement>(null);
  const drawing = useRef(false);

  const ctx = () => {
    const c = canvas.current!.getContext("2d")!;
    c.lineWidth = 2.5;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.strokeStyle = "#0f172a";
    return c;
  };
  const point = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return [((e.clientX - r.left) * W) / r.width, ((e.clientY - r.top) * H) / r.height] as const;
  };

  return (
    <div>
      <canvas
        ref={canvas}
        width={W}
        height={H}
        aria-label="Signature area"
        className="w-full touch-none rounded-lg border border-slate-300 bg-white"
        onPointerDown={(e) => {
          drawing.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          const [x, y] = point(e);
          const c = ctx();
          c.beginPath();
          c.moveTo(x, y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const [x, y] = point(e);
          const c = ctx();
          c.lineTo(x, y);
          c.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
          if (hidden.current) hidden.current.value = canvas.current!.toDataURL("image/png");
        }}
      />
      <input ref={hidden} type="hidden" name="signature" />
      <button
        type="button"
        onClick={() => {
          ctx().clearRect(0, 0, W, H);
          if (hidden.current) hidden.current.value = "";
        }}
        className="mt-2 cursor-pointer text-sm font-medium text-sky-700 underline"
      >
        Clear signature
      </button>
    </div>
  );
}
