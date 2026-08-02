import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, QrCode, Gift } from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import CardCarousel from "../components/CardCarousel.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useVault } from "../context/VaultContext.jsx";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatINR(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

export default function Home() {
  const { user } = useAuth();
  const { cards, upiIds, voucherSummary, expenseSummary, expenses } = useVault();

  const totals = useMemo(() => {
    const credit = cards.filter((c) => c.cardType === "Credit").length;
    const debit = cards.filter((c) => c.cardType === "Debit").length;
    return { total: cards.length, credit, debit };
  }, [cards]);

  const recent = expenses.slice(0, 4);

  return (
    <div>
      <TopBar />
      <div className="px-4">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-gold/70">{greeting()}</p>
            <h1 className="font-display text-3xl font-medium text-ink">{user?.vaultName || "My Vault"}</h1>
          </div>
          <Link to="/profile" className="text-xs text-ink-muted underline decoration-gold/30 underline-offset-4">
            {user?.name?.split(" ")[0]}
          </Link>
        </div>

        {cards.length === 0 ? (
          <Link
            to="/vault?tab=Cards&add=1"
            className="panel mb-6 flex h-44 flex-col items-center justify-center gap-2 rounded-2xl border-dashed text-center"
          >
            <p className="font-display text-lg text-ink">No cards yet</p>
            <p className="text-xs text-ink-muted">Add your first card to see it here</p>
          </Link>
        ) : (
          <div className="mb-6">
            <CardCarousel cards={cards} />
          </div>
        )}

        <div className="panel mb-6 grid grid-cols-3 divide-x divide-gold/10 rounded-2xl p-4">
          <Stat label="Cards" value={totals.total} />
          <Stat label="UPI IDs" value={upiIds.length} />
          <Stat label="Vouchers" value={voucherSummary.activeCount} />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="panel rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-wide text-ink-muted">Spent today</p>
            <p className="mt-1 font-mono-num text-xl text-ink">{formatINR(expenseSummary.today.total)}</p>
          </div>
          <div className="panel rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-wide text-ink-muted">This month</p>
            <p className="mt-1 font-mono-num text-xl text-gold-light">{formatINR(expenseSummary.month.total)}</p>
          </div>
        </div>

        <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-ink-muted">Shortcuts</p>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Link to="/vault?tab=UPI" className="panel-flat flex items-center gap-3 rounded-2xl p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/12">
              <QrCode size={16} className="text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">UPI IDs</p>
              <p className="text-[11px] text-ink-muted">{upiIds.length} saved</p>
            </div>
          </Link>
          <Link to="/vault?tab=Vouchers" className="panel-flat flex items-center gap-3 rounded-2xl p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/12">
              <Gift size={16} className="text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Vouchers</p>
              <p className="text-[11px] text-ink-muted">{formatINR(voucherSummary.activeWorth)} active</p>
            </div>
          </Link>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">Recent activity</p>
          <Link to="/activity" className="flex items-center gap-1 text-xs text-gold-light">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {recent.length > 0 && (
          <div className="space-y-2 pb-4">
            {recent.map((e) => (
              <div key={e._id} className="flex items-center justify-between border-b border-gold/5 py-3">
                <div>
                  <p className="text-sm text-ink">{e.merchant}</p>
                  <p className="text-[11px] text-ink-dim">{new Date(e.date).toLocaleDateString("en-IN")}</p>
                </div>
                <p className="font-mono-num text-sm text-ink">{formatINR(e.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <p className="font-mono-num text-xl text-ink">{value}</p>
      <p className="mt-0.5 text-[11px] text-ink-muted">{label}</p>
    </div>
  );
}
