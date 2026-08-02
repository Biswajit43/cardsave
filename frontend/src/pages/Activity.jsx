import React, { useEffect, useState } from "react";
import { RefreshCw, Plus, ShoppingBag, Trash2 } from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import { useVault } from "../context/VaultContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const merchants = [
  { name: "JioMart", emoji: "🛒" },
  { name: "Amazon", emoji: "📦" },
  { name: "Flipkart", emoji: "🛍️" },
];

const tabs = ["Home", "Recent", "Smart", "Recurring"];

function formatINR(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

export default function Activity() {
  const { expenses, expenseSummary, refreshExpenses, refreshExpenseSummary, addExpense, removeExpense } = useVault();
  const { undoable, success } = useToast();
  const [tab, setTab] = useState("Home");
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tab === "Recent") refreshExpenses({ tab: "recent" });
    if (tab === "Recurring") refreshExpenses({ tab: "recurring" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const submitExpense = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0 || !merchant) return;
    setSaving(true);
    try {
      await addExpense({ merchant, amount: amt, category: "Shopping" });
      success(`Logged ₹${amt.toLocaleString("en-IN")} at ${merchant}`);
      setAmount("");
      setMerchant("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <TopBar
        title="Activity" eyebrow="Where the money went"
        right={
          <button
            onClick={() => {
              refreshExpenseSummary();
              refreshExpenses({ tab: tab === "Home" ? undefined : tab.toLowerCase() });
            }}
            className="rounded-full bg-white/[0.03] p-2 text-ink-muted"
            aria-label="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        }
      />
      <div className="px-4">
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pill whitespace-nowrap px-4 py-1.5 text-xs font-semibold transition-colors ${
                tab === t ? "bg-gold/15 text-gold-light" : "bg-white/[0.03] text-ink-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Home" && (
          <>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div className="panel-flat rounded-2xl p-4">
                <p className="text-xs text-ink-muted">Today</p>
                <p className="mt-1 font-mono-num text-xl text-ink">{formatINR(expenseSummary.today.total)}</p>
                <p className="text-[11px] text-ink-dim">{expenseSummary.today.count} txn</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-signal-green/15 to-signal-green/5 p-4">
                <p className="text-xs text-signal-green/80">This Month</p>
                <p className="mt-1 font-mono-num text-xl text-ink">{formatINR(expenseSummary.month.total)}</p>
                <p className="text-[11px] text-signal-green/60">{expenseSummary.month.count} txn</p>
              </div>
            </div>

            {expenseSummary.topToday && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3">
                <span className="text-lg">🏆</span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-light">Top Today</p>
                  <p className="text-sm font-semibold text-ink">{expenseSummary.topToday.merchant}</p>
                </div>
                <p className="ml-auto text-sm font-bold text-gold-light">
                  {formatINR(expenseSummary.topToday.amount)}
                </p>
              </div>
            )}

            <div className="panel-flat mb-4 rounded-2xl p-4">
              <div className="mb-2 flex items-center gap-2">
                <ShoppingBag size={16} className="text-gold-light" />
                <div>
                  <p className="text-sm font-semibold text-ink">Add Shopping Expense</p>
                  <p className="text-[11px] text-ink-muted">Quick Entry</p>
                </div>
              </div>
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-gold/12 bg-white/[0.03] px-3.5 py-2.5">
                <span className="text-ink-muted">₹</span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="0.00"
                  inputMode="decimal"
                  className="w-full bg-transparent text-sm text-ink placeholder-ink-dim outline-none"
                />
                <button
                  onClick={submitExpense}
                  disabled={saving || !amount || !merchant}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-ink disabled:opacity-30"
                  aria-label="Confirm expense"
                >
                  ✓
                </button>
              </div>
              <select
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="mb-3 w-full rounded-xl border border-gold/12 bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink outline-none"
              >
                <option value="">Select merchant…</option>
                {merchants.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                {merchants.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => setMerchant(m.name)}
                    className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl text-xl transition-colors ${
                      merchant === m.name ? "bg-gold/15 ring-1 ring-gold/40" : "bg-white/[0.03]"
                    }`}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {(tab === "Recent" || tab === "Smart" || tab === "Recurring") && (
          <div className="space-y-3 pb-6">
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]">
                  <ShoppingBag size={28} className="text-gold/30" />
                </div>
                <p className="font-semibold text-ink">No expenses here yet</p>
                <p className="mt-1 text-xs text-ink-muted">Log a quick entry from the Home tab</p>
              </div>
            ) : (
              expenses.map((e) => (
                <div key={e._id} className="panel-flat flex items-center gap-3 rounded-2xl p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-lg">
                    🛍️
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">{e.merchant}</p>
                    <p className="text-xs text-ink-muted">
                      {e.category} · {new Date(e.date).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <p className="font-mono-num text-sm font-bold text-ink">{formatINR(e.amount)}</p>
                  <button
                    onClick={() =>
                      undoable(`${e.merchant} expense removed`, { onExpire: () => removeExpense(e._id) })
                    }
                    className="rounded-lg p-2 text-ink-dim hover:bg-white/[0.03] hover:text-signal-red"
                    aria-label="Delete expense"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
