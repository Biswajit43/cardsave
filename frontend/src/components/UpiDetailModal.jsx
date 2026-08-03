import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { X, QrCode, Download, Share2, Trash2, Star } from "lucide-react";
import CopyButton from "./CopyButton.jsx";
import { useVault } from "../context/VaultContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function UpiDetailModal({ upi, onClose }) {
  const [qrUrl, setQrUrl] = useState(null);
  const { removeUpiId, stageUpiRemoval, restoreUpi, toggleFavorite } = useVault();
  const { undoable, error: toastError } = useToast();

  useEffect(() => {
    if (!upi) return;
    const payload = `upi://pay?pa=${encodeURIComponent(upi.upiId)}&pn=${encodeURIComponent(upi.accountName || upi.label)}`;
    QRCode.toDataURL(payload, {
      margin: 1,
      width: 320,
      color: { dark: "#0d1526", light: "#f1dfa3" },
    }).then(setQrUrl);
  }, [upi]);

  if (!upi) return null;

  const handleDelete = () => {
    onClose();
    stageUpiRemoval(upi._id);
    undoable(`${upi.label} removed`, {
      onExpire: () => removeUpiId(upi._id),
      onUndo: () => restoreUpi(upi),
    });
  };

  const download = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `${upi.label.replace(/\s+/g, "-")}-upi-qr.png`;
    a.click();
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: upi.label, text: upi.upiId });
      } else {
        toastError("Sharing isn't supported on this device — QR downloaded instead.");
        download();
      }
    } catch {
      /* user cancelled share sheet */
    }
  };

  return (
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
                <QrCode size={16} className="text-gold" />
              </div>
              <div>
                <p className="font-display text-lg text-ink">{upi.label}</p>
                <p className="text-[11px] text-ink-muted">{upi.app}{upi.bank ? ` · ${upi.bank}` : ""}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full bg-white/5 p-1.5 text-ink-muted" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="mb-4 flex flex-col items-center rounded-2xl border border-gold/15 bg-white/[0.02] p-5">
            {qrUrl ? (
              <img src={qrUrl} alt={`QR code for ${upi.upiId}`} className="h-44 w-44 rounded-xl" />
            ) : (
              <div className="h-44 w-44 animate-pulse rounded-xl bg-white/5" />
            )}
            <p className="mt-3 font-mono-num text-sm text-ink">{upi.upiId}</p>
            {upi.accountName && <p className="text-xs text-ink-muted">{upi.accountName}</p>}
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2.5">
            <CopyButton value={upi.upiId} className="justify-center" />
            <button
              onClick={download}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-gold/15 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-ink-muted"
            >
              <Download size={13} /> PNG
            </button>
            <button
              onClick={share}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-gold/15 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-ink-muted"
            >
              <Share2 size={13} /> Share
            </button>
          </div>

          <button
            onClick={() => toggleFavorite("upi", upi._id, upi.isFavorite)}
            className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gold/15 bg-white/[0.03] py-2.5 text-sm font-semibold text-ink-muted"
          >
            <Star size={15} className={upi.isFavorite ? "fill-gold text-gold" : ""} />
            {upi.isFavorite ? "Favorited" : "Favorite"}
          </button>

          {upi.notes && (
            <div className="mb-4 rounded-xl border border-gold/10 bg-white/[0.02] p-3 text-xs text-ink-muted">
              {upi.notes}
            </div>
          )}

          <button
            onClick={handleDelete}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-signal-red/20 bg-signal-red/5 py-2.5 text-sm font-medium text-signal-red"
          >
            <Trash2 size={14} /> Delete UPI ID
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
