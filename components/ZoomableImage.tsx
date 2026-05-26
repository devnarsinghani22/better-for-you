"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  /** classes for the inline (thumbnail) image, matches existing markup */
  className?: string;
  /** main product photo loads eager/high priority; labels load lazy */
  priority?: boolean;
};

const MAX_SCALE = 5;

/**
 * Tap/click an image to open it full-screen, then pinch (mobile), double-tap,
 * or scroll-wheel (desktop) to zoom and drag to pan. Dependency-free so it
 * works reliably inside the Instagram in-app browser (92% of our traffic is
 * mobile, ~18% in the IG webview).
 */
export default function ZoomableImage({ src, alt, className, priority }: Props) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  // active pointers (id -> {x,y}); pinch + pan gesture bookkeeping
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const reset = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    reset();
  }, [reset]);

  // lock body scroll + Escape-to-close while the overlay is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      pinchStart.current = { dist: dist(pts[0], pts[1]), scale };
      panStart.current = null;
    } else if (pts.length === 1 && scale > 1) {
      panStart.current = { x: e.clientX, y: e.clientY, tx, ty };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];

    if (pts.length === 2 && pinchStart.current) {
      const next = (dist(pts[0], pts[1]) / pinchStart.current.dist) * pinchStart.current.scale;
      const clamped = Math.min(MAX_SCALE, Math.max(1, next));
      setScale(clamped);
      if (clamped === 1) {
        setTx(0);
        setTy(0);
      }
    } else if (pts.length === 1 && panStart.current && scale > 1) {
      setTx(panStart.current.tx + (e.clientX - panStart.current.x));
      setTy(panStart.current.ty + (e.clientY - panStart.current.y));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) panStart.current = null;
    if (scale <= 1) {
      setTx(0);
      setTy(0);
    }
  };

  const toggleZoom = () => {
    if (scale > 1) reset();
    else setScale(2.5);
  };

  const onWheel = (e: React.WheelEvent) => {
    const next = Math.min(MAX_SCALE, Math.max(1, scale - e.deltaY * 0.002));
    setScale(next);
    if (next === 1) {
      setTx(0);
      setTy(0);
    }
  };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        decoding="async"
        {...(priority
          ? { fetchPriority: "high" as const }
          : { loading: "lazy" as const })}
        onClick={() => setOpen(true)}
        className={`${className ?? ""} cursor-zoom-in`}
      />

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} — zoomed`}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center touch-none select-none"
          onClick={(e) => {
            // tap the dark backdrop (not the image) to close, when not zoomed
            if (e.target === e.currentTarget && scale <= 1) close();
          }}
        >
          <button
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 h-11 w-11 flex items-center justify-center rounded-full bg-white/10 text-white text-2xl leading-none hover:bg-white/20 transition-colors"
          >
            ×
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={toggleZoom}
            onWheel={onWheel}
            style={{
              transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
              transition: pointers.current.size ? "none" : "transform 0.15s ease-out",
              cursor: scale > 1 ? "grab" : "zoom-in",
            }}
            className="max-h-[92vh] max-w-[92vw] object-contain"
          />

          <p className="absolute bottom-5 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 pointer-events-none">
            Pinch or double-tap to zoom
          </p>
        </div>
      )}
    </>
  );
}
