import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutGrid, WalletCards, Receipt, User, Plus } from "lucide-react";
import QuickAddSheet from "./QuickAddSheet.jsx";

const tabs = [
  { to: "/", label: "Home", icon: LayoutGrid, end: true },
  { to: "/vault", label: "Vault", icon: WalletCards },
  null,
  { to: "/activity", label: "Activity", icon: Receipt },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gold/10 bg-navy-deep/95 backdrop-blur-xl">
        <div className="relative mx-auto flex max-w-md items-stretch justify-between px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5">
          {tabs.map((tab, i) =>
            tab === null ? (
              <div key={`fab-${i}`} className="flex flex-1 items-start justify-center">
                <button
                  onClick={() => setSheetOpen(true)}
                  className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-gold-light to-gold shadow-goldglow"
                  aria-label="Quick add"
                >
                  <Plus size={24} className="text-navy-deep" strokeWidth={2.4} />
                </button>
              </div>
            ) : (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
                    isActive ? "text-gold-light" : "text-ink-dim"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <tab.icon size={19} strokeWidth={isActive ? 2.2 : 1.7} />
                    <span>{tab.label}</span>
                  </>
                )}
              </NavLink>
            )
          )}
        </div>
      </nav>
      <QuickAddSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
