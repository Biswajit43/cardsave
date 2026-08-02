import React from "react";

export function Field({ label, error, children }) {
  return (
    <div className="mb-3.5">
      <label className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-signal-red">{error.message}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-gold/15 bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink placeholder-ink-dim outline-none transition-colors focus:border-gold/50";
