import React, { useRef, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  User,
  Lock,
  Bell,
  Send,
  UploadCloud,
  DownloadCloud,
  LogOut,
  Code2,
} from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useVault } from "../context/VaultContext.jsx";
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";

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

function Section({ icon: Icon, title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="panel-flat mb-3 rounded-2xl p-4">
      <button className="flex w-full items-center gap-3 text-left" onClick={() => setOpen((o) => !o)}>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10">
          <Icon size={16} className="text-gold-light" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">{title}</p>
          {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
        </div>
        {open ? <ChevronUp size={16} className="text-ink-muted" /> : <ChevronDown size={16} className="text-ink-muted" />}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const { cards, upiIds, refreshAll } = useVault();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [aboutOpen, setAboutOpen] = useState(false); // Collapsed by default
  const [name, setName] = useState(user?.name || "");
  const [vaultName, setVaultName] = useState(user?.vaultName || "My Vault");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [importMsg, setImportMsg] = useState("");

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg("");
    try {
      await updateProfile({ name, vaultName });
      setProfileMsg("Saved");
      setTimeout(() => setProfileMsg(""), 1500);
    } catch {
      setProfileMsg("Could not save changes");
    } finally {
      setSavingProfile(false);
    }
  };

  const exportBackup = async () => {
    const { data } = await api.get("/backup/export");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batua-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMsg("Importing…");
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const { data } = await api.post("/backup/import", payload);
      setImportMsg(
        `Restored ${data.restored.passwords} passwords, ${data.restored.cards} cards, ${data.restored.upiIds} UPI IDs, ${data.restored.vouchers} vouchers, ${data.restored.expenses} expenses`
      );
      refreshAll();
    } catch {
      setImportMsg("Import failed — check the backup file");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div>
      <TopBar />
      <div className="px-4">
        {/* Profile Settings */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Profile</p>
        <Section icon={User} title="Profile & Preferences" subtitle={user?.email}>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3 w-full rounded-xl border border-gold/12 bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold/50"
          />
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">Vault name</label>
          <input
            value={vaultName}
            onChange={(e) => setVaultName(e.target.value)}
            className="mb-3 w-full rounded-xl border border-gold/12 bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold/50"
          />
          <button
            onClick={saveProfile}
            disabled={savingProfile}
            className="w-full rounded-xl bg-gradient-to-r from-gold-light to-gold py-2.5 text-sm font-semibold text-navy-deep shadow-goldglow disabled:opacity-60"
          >
            {savingProfile ? "Saving…" : profileMsg || "Save Changes"}
          </button>
        </Section>

        {/* Vault Setup */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Vault Setup</p>
        <Section icon={Lock} title="Vault Setup" subtitle={`My Vault · 1 member · ${cards.length} cards · ${upiIds.length} UPI apps`}>
          <p className="text-sm text-ink-muted">
            You have {cards.length} card{cards.length !== 1 ? "s" : ""} and {upiIds.length} UPI ID
            {upiIds.length !== 1 ? "s" : ""} stored securely in this vault.
          </p>
        </Section>

        <Section icon={Bell} title="Push Notifications" subtitle="Bill due · Card expiry · Vouchers">
          <p className="text-sm text-ink-muted">
            Manage reminder preferences from your device notification settings. Batua will alert you before
            bills are due, cards expire, and vouchers near expiry.
          </p>
        </Section>

        <Section icon={Send} title="Telegram Bot" subtitle="Link for voucher & recurring alerts">
          <p className="text-sm text-ink-muted">
            Connect your Telegram account to receive bill, card expiry, and voucher reminders directly in chat.
          </p>
        </Section>

        {/* Backup & Tools */}
        <p className="mb-2 mt-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Data & Tools</p>
        <div className="panel-flat mb-4 rounded-2xl p-4">
          <p className="mb-3 text-xs text-ink-muted">Backup &amp; restore cards + UPI IDs</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportBackup}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/12 bg-white/[0.03] py-2.5 text-sm font-semibold text-ink/80"
            >
              <DownloadCloud size={15} /> Export
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/12 bg-white/[0.03] py-2.5 text-sm font-semibold text-ink/80"
            >
              <UploadCloud size={15} /> Import
            </button>
            <input ref={fileRef} type="file" accept="application/json" onChange={importBackup} className="hidden" />
          </div>
          {importMsg && <p className="mt-2 text-xs text-ink-muted">{importMsg}</p>}
        </div>

        {/* Log Out */}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="mb-4 flex w-full items-center justify-between rounded-2xl border border-signal-red/20 bg-signal-red/10 px-4 py-4 text-signal-red"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <LogOut size={16} /> Log Out
          </span>
          <span className="text-xs text-signal-red/60">You will need to sign in again</span>
        </button>

        {/* About Batua Section (Moved to Bottom) */}
        <div className="panel-flat mb-8 rounded-2xl p-4">
          <button className="flex w-full items-center justify-between" onClick={() => setAboutOpen((o) => !o)}>
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10">
                <Code2 size={16} className="text-gold-light" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">About Batua <span className="text-[10px] font-normal text-ink-muted">v2.0</span></p>
                <p className="text-xs font-medium text-gold-light">
                  Cards, UPI &amp; vouchers—Bharat's simplest digital vault.
                </p>
              </div>
            </div>
            {aboutOpen ? <ChevronUp size={16} className="text-ink-muted" /> : <ChevronDown size={16} className="text-ink-muted" />}
          </button>

          {aboutOpen && (
            <div className="mt-4 border-t border-gold/10 pt-4">
              <p className="mb-4 text-xs leading-relaxed text-ink-muted">
                Batua helps you keep your everyday money tools organized: store cards securely, save UPI IDs,
                track expenses, manage gift vouchers, and get timely reminders. Built for personal and family use with privacy-first storage.
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
    </div>
  );
}