import React, { useState } from "react";
import { ArrowLeft, Code2, ChevronDown, ChevronUp } from "lucide-react";

const featureTags = [
  "Secure Card Vault",
  "UPI ID & QR Manager",
  "Gift Voucher Tracker",
  "Expense History",
  "Recurring Payment Reminders",
  "Family Members",
  "Telegram Voucher Import",
  "Cloud Sync",
  "Offline Ready",
  "Installable App",
  "Import / Export Backup",
  "Help & Support",
];

export default function About() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="px-4 py-4">
      {/* Expandable About Card */}
      <div className="panel-flat rounded-2xl p-4 transition-all duration-300">
        
        {/* Clickable Header / One-line Preview */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-light to-gold shadow-goldglow">
              <Code2 size={20} className="text-navy-deep" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink">About Batua <span className="text-[10px] font-normal text-ink-muted">v2.0</span></h2>
              <p className="text-xs text-gold-light">
                Cards, UPI &amp; vouchers—Bharat's simplest digital vault.
              </p>
            </div>
          </div>
          
          <div className="text-ink-muted">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="mt-4 border-t border-gold/10 pt-4">
            <p className="mb-4 text-xs leading-relaxed text-ink-muted">
              Batua helps you keep your everyday money tools organized: store cards securely, save UPI IDs, track
              expenses, manage gift vouchers, and get timely reminders. Built for personal and family use with privacy-first storage.
            </p>

            <div className="flex flex-wrap gap-2">
              {featureTags.map((tag) => (
                <span key={tag} className="pill bg-gold/12 px-2.5 py-1 text-[11px] font-medium text-gold-light">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 border-t border-gold/8 pt-3 text-xs text-ink-muted">
              <p>Made with ❤️ by Biswajit Bera</p>
              <p className="text-[10px] text-ink-dim">Personal finance, simplified.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}