import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, Timer } from "lucide-react";
import api from "../api/axios.js";

const AUTO_HIDE_MS = 30000;

/**
 * Generic secure-reveal flow. Reuses the account's login password (no second
 * password system): asks for it, POSTs to `revealUrl` to verify + fetch the
 * sensitive payload, then renders `children(data)` for 30 seconds before
 * clearing it from memory.
 */
export default function SecureReveal({ open, onClose, title = "Verify it's you", revealUrl, children }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const reset = () => {
    setPassword("");
    setError("");
    setData(null);
    setSecondsLeft(0);
    clearTimeout(timerRef.current);
    clearInterval(countdownRef.current);
  };

  useEffect(() => {
    if (!open) reset();
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(countdownRef.current);
    };
  }, [open]);

  const verify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data: revealed } = await api.post(revealUrl, { password });
      setData(revealed);
      setSecondsLeft(AUTO_HIDE_MS / 1000);
      timerRef.current = setTimeout(() => reset(), AUTO_HIDE_MS);
      countdownRef.current = setInterval(() => {
        setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm"
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
                <ShieldCheck size={17} className="text-gold" />
                <h2 className="font-display text-lg text-ink">{title}</h2>
              </div>
              <button onClick={onClose} className="rounded-full bg-white/5 p-1.5 text-ink-muted" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {!data ? (
              <form onSubmit={verify}>
                <p className="mb-3 text-xs text-ink-muted">
                  For your security, confirm your account password to reveal this information.
                </p>
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Account password"
                  className="mb-3 w-full rounded-xl border border-gold/15 bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold/50"
                />
                {error && <p className="mb-3 text-xs text-signal-red">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full rounded-xl bg-gradient-to-r from-gold-light to-gold py-3 text-sm font-semibold text-navy-deep shadow-goldglow disabled:opacity-60"
                >
                  {loading ? "Verifying…" : "Reveal"}
                </button>
              </form>
            ) : (
              <div>
                {children(data)}
                <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-dim">
                  <Timer size={12} />
                  <span>Hides again in {secondsLeft}s</span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
