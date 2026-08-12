'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// Where the light sits when there is no pointer to follow. Held clear of the
// frame rather than on its edge: resting at y=0 would park the source at the
// brightest position it can occupy, so the untouched page would glow harder
// than any real cursor position and visibly dim the moment the mouse appeared.
// Above the frame it reads as a soft key light with room to brighten.
// Keep in sync with the --aios-light-* fallbacks in globals.css, which cover
// touch, reduced motion, and pre-hydration.
const REST_X = 50;
const REST_Y = -45;

// Per-frame approach rate. Low enough that the light trails the cursor instead
// of snapping to it, which is what sells it as a moving source.
const EASE = 0.12;

// The light is allowed to travel outside the frame (a source off to the side is
// the whole point of rim lighting) but not so far that the frame goes unlit.
const MAX_X = 140;
const MIN_X = -40;
const MAX_Y = 140;
const MIN_Y = -90;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function HeroFrameShell({ children }: { children: ReactNode }) {
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    // Following the cursor is a pointer affordance, and it is motion. Leave the
    // static top-center lighting in place for touch and for reduced motion.
    if (
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let targetX = REST_X;
    let targetY = REST_Y;
    let x = REST_X;
    let y = REST_Y;
    let frame = 0;
    let onScreen = true;

    const paint = () => {
      x += (targetX - x) * EASE;
      y += (targetY - y) * EASE;

      shell.style.setProperty('--aios-light-x', `${x.toFixed(2)}%`);
      shell.style.setProperty('--aios-light-y', `${y.toFixed(2)}%`);
      // The specular streak lives on the top edge, so it peaks when the light
      // is level with that edge and falls off as the source moves away. The
      // falloff is wide enough that the streak is still partly lit at rest.
      shell.style.setProperty(
        '--aios-light-spec',
        Math.max(0, 1 - Math.abs(y) / 110).toFixed(3),
      );

      const settled =
        Math.abs(targetX - x) < 0.05 && Math.abs(targetY - y) < 0.05;
      frame = settled ? 0 : requestAnimationFrame(paint);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const handleMove = (event: PointerEvent) => {
      if (!onScreen) return;
      const rect = shell.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      targetX = clamp(
        ((event.clientX - rect.left) / rect.width) * 100,
        MIN_X,
        MAX_X,
      );
      targetY = clamp(
        ((event.clientY - rect.top) / rect.height) * 100,
        MIN_Y,
        MAX_Y,
      );
      schedule();
    };

    const handleRest = () => {
      targetX = REST_X;
      targetY = REST_Y;
      schedule();
    };

    // The bloom layers are wide blurs, so repainting them while the hero is
    // scrolled away is pure waste.
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (!onScreen) handleRest();
      },
      { rootMargin: '200px' },
    );
    observer.observe(shell);

    window.addEventListener('pointermove', handleMove, { passive: true });
    document.addEventListener('pointerleave', handleRest);

    return () => {
      observer.disconnect();
      window.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerleave', handleRest);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="aios-hero-frame-shell" ref={shellRef}>
      <div
        className="aios-hero-frame-bloom aios-hero-frame-bloom-wide"
        aria-hidden
      />
      <div
        className="aios-hero-frame-bloom aios-hero-frame-bloom-far"
        aria-hidden
      />
      <div
        className="aios-hero-frame-bloom aios-hero-frame-bloom-near"
        aria-hidden
      />
      <div className="aios-hero-frame-rim" aria-hidden />
      {children}
    </div>
  );
}
