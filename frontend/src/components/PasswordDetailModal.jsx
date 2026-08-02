import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, KeyRound, ShieldCheck, Trash2, Star, ExternalLink } from "lucide-react";
import SecureReveal from "./SecureReveal.jsx";
import CopyButton from "./CopyButton.jsx";
import { useVault } from "../context/VaultContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

function faviconFor(url, site) {
  try {
    const host = url ? new URL(url.startsWith("http") ? url : `https://${url}`).hostname : `${site}.com`;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return null;
  }
}

export default function PasswordDetailModal({ entry, onClose }) {
  const [revealOpen, setRevealOpen] = useState(false);
  const { removePassword, toggleFavorite } = useVault();
  const { undoable } = useToast();

  if (!entry) return null;
  const favicon = faviconFor(entry.url, entry.site);

  const handleDelete = () => {
    onClose();
    undoable(`${entry.site} password removed`, {
      onExpire: () => removePassword(entry._id),
    });
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[55] flex items-end justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="panel w-full max-w-md rounded-t-3xl p-5 pb-[max(1.75rem,env(safe-area-inset-bottom))]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 overflow-hidden">
                  {favicon ? <img src={favicon} alt="" className="h-5 w-5" /> : <KeyRound size={16} className="text-gold" />}
                </div>
                <div>
                  <p className="font-display text-lg text-ink">{entry.site}</p>
                  {entry.url && (
                    <a
                      href={entry.url.startsWith("http") ? entry.url : `https://${entry.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-ink-muted"
                    >
                      {entry.url} <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="rounded-full bg-white/5 p-1.5 text-ink-muted" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="panel-flat mb-4 rounded-2xl p-4">
              <p className="text-[11px] uppercase tracking-wide text-ink-muted">Username</p>
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm text-ink">{entry.username || "—"}</p>
                {entry.username && <CopyButton value={entry.username} />}
              </div>
              <p className="text-[11px] uppercase tracking-wide text-ink-muted">Password</p>
              <p className="font-mono-num text-sm text-ink">••••••••••••</p>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setRevealOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-light to-gold py-2.5 text-sm font-semibold text-navy-deep shadow-goldglow"
              >
                <ShieldCheck size={15} /> Reveal password
              </button>
              <button
                onClick={() => toggleFavorite("password", entry._id, entry.isFavorite)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/15 bg-white/[0.03] py-2.5 text-sm font-semibold text-ink-muted"
              >
                <Star size={15} className={entry.isFavorite ? "fill-gold text-gold" : ""} />
                {entry.isFavorite ? "Favorited" : "Favorite"}
              </button>
            </div>

            {entry.notes && (
              <div className="mb-4 rounded-xl border border-gold/10 bg-white/[0.02] p-3 text-xs text-ink-muted">
                {entry.notes}
              </div>
            )}

            <button
              onClick={handleDelete}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-signal-red/20 bg-signal-red/5 py-2.5 text-sm font-medium text-signal-red"
            >
              <Trash2 size={14} /> Delete entry
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <SecureReveal open={revealOpen} onClose={() => setRevealOpen(false)} revealUrl={`/passwords/${entry._id}/reveal`}>
        {(data) => (
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-wide text-ink-muted">Password</p>
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono-num text-base text-gold-light">{data.password}</p>
              <CopyButton value={data.password} />
            </div>
          </div>
        )}
      </SecureReveal>
    </>
  );
}
