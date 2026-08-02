import React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

function maskNumber(last4) {
  return `•••• •••• •••• ${last4}`;
}

export default function CardCarousel({ cards }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
      {cards.map((card) => (
        <div
          key={card._id}
          className="relative flex h-44 w-72 shrink-0 snap-center flex-col justify-between rounded-2xl border p-5"
          style={{
            borderColor: "rgba(201,162,39,0.25)",
            background:
              "linear-gradient(135deg, #16233d 0%, #0d1526 55%, #0a1120 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
            style={{
              background:
                "radial-gradient(circle at 85% 15%, rgba(201,162,39,0.18), transparent 55%)",
            }}
          />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">{card.cardType}</p>
              <p className="font-display text-lg font-medium text-ink">{card.bank}</p>
            </div>
            <div className="h-6 w-8 rounded-[4px]" style={{ background: "linear-gradient(135deg,#e8c766,#8a6d1a)" }} />
          </div>
          <div className="relative">
            <p className="font-mono-num text-lg text-ink/90">{maskNumber(card.last4)}</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[11px] text-ink-dim">
                {card.nickname || card.network}
                {card.expiryMonth && card.expiryYear
                  ? ` · ${String(card.expiryMonth).padStart(2, "0")}/${String(card.expiryYear).slice(-2)}`
                  : ""}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gold">{card.network}</p>
            </div>
          </div>
        </div>
      ))}

      <Link
        to="/vault?tab=Cards&add=1"
        className="flex h-44 w-40 shrink-0 snap-center flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gold/25 text-gold/70"
      >
        <Plus size={20} />
        <span className="text-xs font-medium">Add a card</span>
      </Link>
    </div>
  );
}
