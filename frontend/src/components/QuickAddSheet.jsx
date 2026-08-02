import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, QrCode, Gift, Receipt, X } from "lucide-react";

const actions = [
  { label: "Add Card", desc: "Credit, debit or prepaid", icon: CreditCard, to: "/vault?tab=Cards&add=1" },
  { label: "Add UPI ID", desc: "Save a wallet or bank UPI", icon: QrCode, to: "/vault?tab=UPI&add=1" },
  { label: "Add Voucher", desc: "Gift card or store voucher", icon: Gift, to: "/vault?tab=Vouchers&add=1" },
  { label: "Log Expense", desc: "Quick entry for today", icon: Receipt, to: "/activity" },
];

export default function QuickAddSheet({ open, onClose }) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm"
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
            <div className="mb-5 flex items-center justify-between">
              <p className="font-display text-lg text-ink">Add to vault</p>
              <button onClick={onClose} className="rounded-full bg-white/5 p-1.5 text-ink-muted" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {actions.map(({ label, desc, icon: Icon, to }) => (
                <button
                  key={label}
                  onClick={() => {
                    onClose();
                    navigate(to);
                  }}
                  className="panel-flat flex flex-col items-start gap-3 rounded-2xl p-4 text-left"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/12">
                    <Icon size={17} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{label}</p>
                    <p className="text-[11px] text-ink-muted">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
