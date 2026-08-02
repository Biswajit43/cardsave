import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, CreditCard, QrCode, KeyRound, Star, ClipboardList } from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import AddCardModal from "../components/AddCardModal.jsx";
import AddUpiModal from "../components/AddUpiModal.jsx";
import AddVoucherModal from "../components/AddVoucherModal.jsx";
import AddPasswordModal from "../components/AddPasswordModal.jsx";
import CardDetailModal from "../components/CardDetailModal.jsx";
import UpiDetailModal from "../components/UpiDetailModal.jsx";
import VoucherDetailModal from "../components/VoucherDetailModal.jsx";
import PasswordDetailModal from "../components/PasswordDetailModal.jsx";
import { useVault } from "../context/VaultContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

function formatINR(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

const segments = ["Passwords", "Cards", "UPI", "Vouchers"];

export default function Vault() {
  const [params, setParams] = useSearchParams();
  const initialTab = segments.includes(params.get("tab")) ? params.get("tab") : "Passwords";
  const [tab, setTab] = useState(initialTab);
  const [modalOpen, setModalOpen] = useState(params.get("add") === "1");

  useEffect(() => {
    if (params.get("tab") || params.get("add")) setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchTab = (t) => {
    setTab(t);
    setModalOpen(false);
  };

  return (
    <div>
      <TopBar
        title="Vault"
        eyebrow="Everything, encrypted"
        right={
          <button
            onClick={() => setModalOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold shadow-goldglow"
            aria-label="Add"
          >
            <Plus size={18} className="text-navy-deep" />
          </button>
        }
      />
      <div className="px-4">
        <div className="no-scrollbar mb-5 flex gap-1 overflow-x-auto rounded-full border border-gold/15 bg-white/[0.02] p-1">
          {segments.map((s) => (
            <button
              key={s}
              onClick={() => switchTab(s)}
              className={`flex-1 whitespace-nowrap rounded-full py-2 px-3 text-xs font-semibold transition-colors ${
                tab === s ? "bg-gold/15 text-gold-light" : "text-ink-dim"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {tab === "Passwords" && <PasswordsPanel onAdd={() => setModalOpen(true)} />}
        {tab === "Cards" && <CardsPanel onAdd={() => setModalOpen(true)} />}
        {tab === "UPI" && <UpiPanel onAdd={() => setModalOpen(true)} />}
        {tab === "Vouchers" && <VouchersPanel onAdd={() => setModalOpen(true)} />}
      </div>

      <AddPasswordModal open={modalOpen && tab === "Passwords"} onClose={() => setModalOpen(false)} />
      <AddCardModal open={modalOpen && tab === "Cards"} onClose={() => setModalOpen(false)} />
      <AddUpiModal open={modalOpen && tab === "UPI"} onClose={() => setModalOpen(false)} />
      <AddVoucherModal open={modalOpen && tab === "Vouchers"} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function FavStar({ active }) {
  return <Star size={13} className={active ? "fill-gold text-gold" : "text-ink-dim/0"} />;
}

function PasswordsPanel({ onAdd }) {
  const { passwords, refreshPasswords } = useVault();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => refreshPasswords({ search }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const sorted = [...passwords].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-gold/12 bg-white/[0.02] px-3.5 py-2.5">
        <Search size={15} className="text-ink-dim" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search saved logins…"
          className="w-full bg-transparent text-sm text-ink placeholder-ink-dim outline-none"
        />
      </div>
      {sorted.length === 0 ? (
        <EmptyState icon={KeyRound} title="No passwords saved" subtitle="Save your first login to get started" onAdd={onAdd} cta="Add Password" />
      ) : (
        <div className="space-y-2.5 pb-4">
          {sorted.map((p) => (
            <button key={p._id} onClick={() => setActive(p)} className="panel-flat flex w-full items-center gap-3 rounded-2xl p-4 text-left">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10">
                <KeyRound size={18} className="text-gold" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{p.site}</p>
                <p className="text-xs text-ink-muted">{p.username || "No username saved"}</p>
              </div>
              <FavStar active={p.isFavorite} />
            </button>
          ))}
        </div>
      )}
      <PasswordDetailModal entry={active} onClose={() => setActive(null)} />
    </div>
  );
}

function CardsPanel({ onAdd }) {
  const { cards, refreshCards } = useVault();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(null);
  const filters = ["All", "Credit", "Debit", "Prepaid"];

  useEffect(() => {
    const t = setTimeout(() => refreshCards({ type: filter, search }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter]);

  const sorted = [...cards].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-gold/12 bg-white/[0.02] px-3.5 py-2.5">
        <Search size={15} className="text-ink-dim" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by bank, last 4, name…"
          className="w-full bg-transparent text-sm text-ink placeholder-ink-dim outline-none"
        />
      </div>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold ${
              filter === f ? "bg-gold/15 text-gold-light" : "bg-white/[0.03] text-ink-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={CreditCard} title="No cards found" subtitle="Add your first card to get started" onAdd={onAdd} cta="Add Card" />
      ) : (
        <div className="space-y-2.5 pb-4">
          {sorted.map((card) => (
            <button key={card._id} onClick={() => setActive(card)} className="panel-flat flex w-full items-center gap-3 rounded-2xl p-4 text-left">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10">
                <CreditCard size={18} className="text-gold" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">
                  {card.bank} {card.nickname ? `· ${card.nickname}` : ""}
                </p>
                <p className="font-mono-num text-xs text-ink-muted">
                  {card.cardType} · {card.network} · •••• {card.last4}
                </p>
              </div>
              <FavStar active={card.isFavorite} />
            </button>
          ))}
        </div>
      )}
      <CardDetailModal card={active} onClose={() => setActive(null)} />
    </div>
  );
}

function UpiPanel({ onAdd }) {
  const { upiIds, refreshUpiIds } = useVault();
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(null);
  const apps = ["All", "GPay", "PhonePe", "Paytm", "BHIM", "Other"];

  const applyFilter = (app) => {
    setFilter(app);
    refreshUpiIds({ app });
  };

  const sorted = [...upiIds].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

  return (
    <div>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {apps.map((a) => (
          <button
            key={a}
            onClick={() => applyFilter(a)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold ${
              filter === a ? "bg-gold/15 text-gold-light" : "bg-white/[0.03] text-ink-muted"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={QrCode} title="No UPI IDs yet" subtitle="Add your UPI IDs to generate QR codes instantly" onAdd={onAdd} cta="Add UPI ID" />
      ) : (
        <div className="space-y-2.5 pb-4">
          {sorted.map((upi) => (
            <button key={upi._id} onClick={() => setActive(upi)} className="panel-flat flex w-full items-center gap-3 rounded-2xl p-4 text-left">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10">
                <QrCode size={18} className="text-gold" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{upi.label}</p>
                <p className="font-mono-num text-xs text-ink-muted">{upi.upiId}</p>
              </div>
              <FavStar active={upi.isFavorite} />
            </button>
          ))}
        </div>
      )}
      <UpiDetailModal upi={active} onClose={() => setActive(null)} />
    </div>
  );
}

function VouchersPanel({ onAdd }) {
  const { vouchers, voucherSummary } = useVault();
  const [active, setActive] = useState(null);
  const sorted = [...vouchers].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

  return (
    <div>
      <div className="panel mb-4 rounded-2xl p-4">
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <p className="font-mono-num text-xl text-gold-light">{formatINR(voucherSummary.activeWorth)}</p>
            <p className="text-[11px] text-ink-muted">Active worth</p>
          </div>
          <div>
            <p className="font-mono-num text-xl text-ink">{voucherSummary.activeCount}</p>
            <p className="text-[11px] text-ink-muted">Active vouchers</p>
          </div>
        </div>
        <p className="text-[11px] text-signal-green">Lifetime redeemed {formatINR(voucherSummary.lifetimeRedeemed)}</p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Vault is empty" subtitle="Add your gift cards & vouchers. Never let them expire unused." onAdd={onAdd} cta="Add Voucher" />
      ) : (
        <div className="space-y-2.5 pb-4">
          {sorted.map((v) => (
            <button key={v._id} onClick={() => setActive(v)} className="panel-flat flex w-full items-center gap-3 rounded-2xl p-4 text-left">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-lg">🎁</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{v.brand}</p>
                <p className="font-mono-num text-xs text-ink-muted">
                  {formatINR(v.balance)} of {formatINR(v.value)}
                </p>
              </div>
              <FavStar active={v.isFavorite} />
            </button>
          ))}
        </div>
      )}
      <VoucherDetailModal voucher={active} onClose={() => setActive(null)} />
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, onAdd, cta }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/15 bg-white/[0.02]">
        <Icon size={26} className="text-gold/60" />
      </div>
      <p className="font-display text-lg text-ink">{title}</p>
      <p className="mt-1 px-6 text-xs text-ink-muted">{subtitle}</p>
      <button
        onClick={onAdd}
        className="mt-6 rounded-xl bg-gradient-to-r from-gold-light to-gold px-5 py-2.5 text-sm font-semibold text-navy-deep shadow-goldglow"
      >
        + {cta}
      </button>
    </div>
  );
}
