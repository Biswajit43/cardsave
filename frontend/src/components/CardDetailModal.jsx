import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, ShieldCheck, Trash2, Star } from "lucide-react";
import SecureReveal from "./SecureReveal.jsx";
import CopyButton from "./CopyButton.jsx";
import { useVault } from "../context/VaultContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function CardDetailModal({ card, onClose }) {
  const [revealOpen, setRevealOpen] = useState(false);
  const { removeCard, toggleFavorite } = useVault();
  const { undoable } = useToast();

  if (!card) return null;

  const handleDelete = () => {
    onClose();
    undoable(`${card.bank} card removed`, {
      onExpire: () => removeCard(card._id),
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
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10">
                  <CreditCard size={16} className="text-gold" />
                </div>
                <div>
                  <p className="font-display text-lg text-ink">{card.bank}</p>
                  <p className="text-[11px] text-ink-muted">{card.cardType} · {card.network}</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-full bg-white/5 p-1.5 text-ink-muted" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="panel-flat mb-4 rounded-2xl p-4">
              <p className="text-[11px] uppercase tracking-wide text-ink-muted">Card holder</p>
              <p className="mb-3 text-sm text-ink">{card.cardHolder || "—"}</p>
              <p className="text-[11px] uppercase tracking-wide text-ink-muted">Number</p>
              <p className="font-mono-num text-sm text-ink">•••• •••• •••• {card.last4}</p>
              <p className="mt-3 text-[11px] uppercase tracking-wide text-ink-muted">CVV</p>
              <p className="font-mono-num text-sm text-ink">•••</p>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setRevealOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-light to-gold py-2.5 text-sm font-semibold text-navy-deep shadow-goldglow"
              >
                <ShieldCheck size={15} /> Reveal details
              </button>
              <button
                onClick={() => toggleFavorite("card", card._id, card.isFavorite)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/15 bg-white/[0.03] py-2.5 text-sm font-semibold text-ink-muted"
              >
                <Star size={15} className={card.isFavorite ? "fill-gold text-gold" : ""} />
                {card.isFavorite ? "Favorited" : "Favorite"}
              </button>
            </div>

            {card.notes && (
              <div className="mb-4 rounded-xl border border-gold/10 bg-white/[0.02] p-3 text-xs text-ink-muted">
                {card.notes}
              </div>
            )}

            <button
              onClick={handleDelete}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-signal-red/20 bg-signal-red/5 py-2.5 text-sm font-medium text-signal-red"
            >
              <Trash2 size={14} /> Delete card
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <SecureReveal open={revealOpen} onClose={() => setRevealOpen(false)} revealUrl={`/cards/${card._id}/reveal`}>
        {(data) => (
          <div className="space-y-3">
            {data.cardHolder && (
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-wide text-ink-muted">Card holder</p>
                <p className="text-sm text-ink">{data.cardHolder}</p>
              </div>
            )}
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-wide text-ink-muted">Card number</p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono-num text-base text-gold-light">{data.cardNumber}</p>
                <CopyButton value={data.cardNumber} />
              </div>
            </div>
            {data.cvv && (
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-wide text-ink-muted">CVV</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono-num text-base text-gold-light">{data.cvv}</p>
                  <CopyButton value={data.cvv} />
                </div>
              </div>
            )}
          </div>
        )}
      </SecureReveal>
    </>
  );
}
