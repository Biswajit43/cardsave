import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, KeyRound, CreditCard, QrCode, Gift, CornerDownLeft } from "lucide-react";
import { useVault } from "../context/VaultContext.jsx";

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { passwords, cards, upiIds, vouchers } = useVault();
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const match = (s) => (s || "").toLowerCase().includes(q);

    const passwordHits = passwords
      .filter((p) => match(p.site) || match(p.username) || match(p.url))
      .map((p) => ({ kind: "Passwords", icon: KeyRound, label: p.site, sub: p.username }));

    const cardHits = cards
      .filter((c) => match(c.bank) || match(c.nickname) || match(c.last4))
      .map((c) => ({ kind: "Cards", icon: CreditCard, label: c.bank, sub: `•••• ${c.last4}` }));

    const upiHits = upiIds
      .filter((u) => match(u.label) || match(u.upiId) || match(u.bank))
      .map((u) => ({ kind: "UPI", icon: QrCode, label: u.label, sub: u.upiId }));

    const voucherHits = vouchers
      .filter((v) => match(v.brand) || match(v.notes))
      .map((v) => ({ kind: "Vouchers", icon: Gift, label: v.brand, sub: `₹${v.balance}` }));

    return [...passwordHits, ...cardHits, ...upiHits, ...voucherHits].slice(0, 20);
  }, [query, passwords, cards, upiIds, vouchers]);

  const go = (kind) => {
    setOpen(false);
    setQuery("");
    navigate(`/vault?tab=${kind}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 px-4 pt-24 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="panel no-scrollbar max-h-[60vh] w-full max-w-md overflow-y-auto rounded-2xl p-2"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-gold/10 px-3 py-3">
              <Search size={16} className="text-gold" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search passwords, cards, UPI, vouchers…"
                className="w-full bg-transparent text-sm text-ink placeholder-ink-dim outline-none"
              />
              <kbd className="rounded border border-gold/15 px-1.5 py-0.5 text-[10px] text-ink-dim">Esc</kbd>
            </div>
            <div className="py-1">
              {query && results.length === 0 && (
                <p className="px-4 py-6 text-center text-xs text-ink-muted">No matches for "{query}"</p>
              )}
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => go(r.kind)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/5"
                >
                  <r.icon size={15} className="text-gold" />
                  <div className="flex-1">
                    <p className="text-sm text-ink">{r.label}</p>
                    <p className="text-[11px] text-ink-dim">{r.sub}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-ink-dim">{r.kind}</span>
                  <CornerDownLeft size={12} className="text-ink-dim" />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
