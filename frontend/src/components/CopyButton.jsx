import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ value, label = "Copy", className = "" }) {
  const [copied, setCopied] = useState(false);

  const copy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 rounded-lg border border-gold/15 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-ink-muted transition-transform active:scale-95 ${className}`}
    >
      {copied ? <Check size={13} className="text-signal-green" /> : <Copy size={13} />}
      {copied ? "Copied" : label}
    </button>
  );
}
