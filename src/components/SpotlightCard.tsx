"use client";

import type { PointerEvent, ReactNode } from "react";

// Pointer-following glow, inspired by React Bits' Spotlight Card (https://reactbits.dev).
// The position is written to CSS variables directly, so moving the pointer never re-renders.
export function SpotlightCard({ className = "", children }: { className?: string; children: ReactNode }) {
  function move(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      onPointerMove={move}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-accent/40 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
        style={{
          background:
            "radial-gradient(400px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in srgb, var(--accent) 12%, transparent), transparent 70%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
