import React from "react";

export default function TopBar({ title, eyebrow, right }) {
  return (
    <div className="sticky top-0 z-30 bg-base/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center gap-1.5 px-4 pt-2.5 pb-1.5 text-[11px] text-ink-dim">
        <span className="h-1.5 w-1.5 rounded-full bg-signal-green" />
        <span>Synced just now</span>
      </div>
      {title && (
        <div className="mx-auto flex max-w-md items-center justify-between px-4 pb-4">
          <div>
            {eyebrow && <p className="mb-0.5 text-[11px] uppercase tracking-[0.14em] text-gold/70">{eyebrow}</p>}
            <h1 className="font-display text-2xl font-medium text-ink">{title}</h1>
          </div>
          {right}
        </div>
      )}
    </div>
  );
}
