import React, { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Undo2 } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = Math.random().toString(36).slice(2);
      const entry = { id, type: "success", duration: 3000, ...toast };
      setToasts((prev) => [...prev, entry]);
      if (!entry.action) {
        setTimeout(() => dismiss(id), entry.duration);
      }
      return id;
    },
    [dismiss]
  );

  const success = useCallback((message) => push({ message, type: "success" }), [push]);
  const error = useCallback((message) => push({ message, type: "error" }), [push]);

  // Shows a toast with an Undo button for `duration` ms. If not undone,
  // `onExpire` runs (the real delete). If undone, `onUndo` runs instead.
  const undoable = useCallback(
    (message, { onExpire, onUndo, duration = 10000 }) => {
      const id = push({ message, type: "undo", duration, action: true });
      const timer = setTimeout(() => {
        dismiss(id);
        onExpire?.();
      }, duration);
      setToasts((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                onUndo: () => {
                  clearTimeout(timer);
                  dismiss(id);
                  onUndo?.();
                },
              }
            : t
        )
      );
    },
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={{ success, error, undoable }}>
      {children}
      <div className="pointer-events-none fixed bottom-24 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="panel pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-2xl px-4 py-3 shadow-lift"
            >
              {t.type === "success" && <CheckCircle2 size={16} className="shrink-0 text-signal-green" />}
              {t.type === "error" && <XCircle size={16} className="shrink-0 text-signal-red" />}
              {t.type === "undo" && <Undo2 size={16} className="shrink-0 text-gold" />}
              <p className="flex-1 text-xs text-ink">{t.message}</p>
              {t.type === "undo" && (
                <button onClick={t.onUndo} className="text-xs font-semibold text-gold-light">
                  Undo
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
