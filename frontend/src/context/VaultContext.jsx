import React, { createContext, useCallback, useContext, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "./AuthContext.jsx";

const VaultContext = createContext(null);

export const VaultProvider = ({ children }) => {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [upiIds, setUpiIds] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [voucherSummary, setVoucherSummary] = useState({ activeWorth: 0, activeCount: 0, lifetimeRedeemed: 0 });
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState({
    today: { total: 0, count: 0 },
    month: { total: 0, count: 0 },
    topToday: null,
  });
  const [passwords, setPasswords] = useState([]);
  const [dashboard, setDashboard] = useState({
    counts: { cards: 0, upiIds: 0, vouchers: 0, passwords: 0 },
    recent: [],
  });
  const [loadingVault, setLoadingVault] = useState(false);

  const refreshCards = useCallback(async (params = {}) => {
    const { data } = await api.get("/cards", { params });
    setCards(data.cards);
    return data.cards;
  }, []);

  const refreshUpiIds = useCallback(async (params = {}) => {
    const { data } = await api.get("/upi", { params });
    setUpiIds(data.upiIds);
    return data.upiIds;
  }, []);

  const refreshVouchers = useCallback(async () => {
    const { data } = await api.get("/vouchers");
    setVouchers(data.vouchers);
    setVoucherSummary(data.summary);
    return data.vouchers;
  }, []);

  const refreshExpenses = useCallback(async (params = {}) => {
    const { data } = await api.get("/expenses", { params });
    setExpenses(data.expenses);
    return data.expenses;
  }, []);

  const refreshExpenseSummary = useCallback(async () => {
    const { data } = await api.get("/expenses/summary");
    setExpenseSummary(data);
    return data;
  }, []);

  const refreshPasswords = useCallback(async (params = {}) => {
    const { data } = await api.get("/passwords", { params });
    setPasswords(data.passwords);
    return data.passwords;
  }, []);

  const refreshDashboard = useCallback(async () => {
    const { data } = await api.get("/dashboard/summary");
    setDashboard(data);
    return data;
  }, []);

  const refreshAll = useCallback(async () => {
    if (!user) return;
    setLoadingVault(true);
    try {
      await Promise.all([
        refreshCards(),
        refreshUpiIds(),
        refreshVouchers(),
        refreshExpenses(),
        refreshExpenseSummary(),
        refreshPasswords(),
        refreshDashboard(),
      ]);
    } finally {
      setLoadingVault(false);
    }
  }, [
    user,
    refreshCards,
    refreshUpiIds,
    refreshVouchers,
    refreshExpenses,
    refreshExpenseSummary,
    refreshPasswords,
    refreshDashboard,
  ]);

  // --- Cards ---
  const addCard = async (payload) => {
    const { data } = await api.post("/cards", payload);
    setCards((prev) => [data.card, ...prev]);
    return data.card;
  };
  const removeCard = async (id) => {
    await api.delete(`/cards/${id}`);
    setCards((prev) => prev.filter((c) => c._id !== id));
  };
  const stageCardRemoval = useCallback((id) => {
    setCards((prev) => prev.filter((c) => c._id !== id));
  }, []);
  const restoreCard = useCallback((card) => {
    setCards((prev) => [card, ...prev]);
  }, []);

  // --- UPI ---
  const addUpiId = async (payload) => {
    const { data } = await api.post("/upi", payload);
    setUpiIds((prev) => [data.upi, ...prev]);
    return data.upi;
  };
  const removeUpiId = async (id) => {
    await api.delete(`/upi/${id}`);
    setUpiIds((prev) => prev.filter((u) => u._id !== id));
  };
  const stageUpiRemoval = useCallback((id) => {
    setUpiIds((prev) => prev.filter((u) => u._id !== id));
  }, []);
  const restoreUpi = useCallback((upi) => {
    setUpiIds((prev) => [upi, ...prev]);
  }, []);

  // --- Vouchers ---
  const addVoucher = async (payload) => {
    const { data } = await api.post("/vouchers", payload);
    setVouchers((prev) => [data.voucher, ...prev]);
    await refreshVouchers();
    return data.voucher;
  };
  const redeemVoucher = async (id, amount) => {
    const { data } = await api.post(`/vouchers/${id}/redeem`, { amount });
    await refreshVouchers();
    return data.voucher;
  };
  const removeVoucher = async (id) => {
    await api.delete(`/vouchers/${id}`);
    await refreshVouchers();
  };

  // --- Expenses ---
  const addExpense = async (payload) => {
    const { data } = await api.post("/expenses", payload);
    setExpenses((prev) => [data.expense, ...prev]);
    await refreshExpenseSummary();
    return data.expense;
  };
  const removeExpense = async (id) => {
    await api.delete(`/expenses/${id}`);
    setExpenses((prev) => prev.filter((e) => e._id !== id));
    await refreshExpenseSummary();
  };

  // --- Passwords ---
  const addPassword = async (payload) => {
    const { data } = await api.post("/passwords", payload);
    setPasswords((prev) => [data.password, ...prev]);
    return data.password;
  };
  const removePassword = async (id) => {
    await api.delete(`/passwords/${id}`);
    setPasswords((prev) => prev.filter((p) => p._id !== id));
  };

  // --- Favorites (works across cards / upiIds / vouchers / passwords) ---
  const toggleFavorite = async (kind, id, isFavorite) => {
    const endpoints = { card: "/cards", upi: "/upi", voucher: "/vouchers", password: "/passwords" };
    const setters = { card: setCards, upi: setUpiIds, voucher: setVouchers, password: setPasswords };
    const { data } = await api.put(`${endpoints[kind]}/${id}`, { isFavorite: !isFavorite });
    const updated = data.card || data.upi || data.voucher || data.password;
    setters[kind]((prev) => prev.map((item) => (item._id === id ? { ...item, isFavorite: updated.isFavorite } : item)));
  };

  const value = {
    cards,
    upiIds,
    vouchers,
    voucherSummary,
    expenses,
    expenseSummary,
    passwords,
    dashboard,
    loadingVault,
    refreshAll,
    refreshCards,
    refreshUpiIds,
    refreshVouchers,
    refreshExpenses,
    refreshExpenseSummary,
    refreshPasswords,
    refreshDashboard,
    addCard,
    removeCard,
    stageCardRemoval,
    restoreCard,
    addUpiId,
    removeUpiId,
    stageUpiRemoval,
    restoreUpi,
    addVoucher,
    redeemVoucher,
    removeVoucher,
    addExpense,
    removeExpense,
    addPassword,
    removePassword,
    toggleFavorite,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
};

export const useVault = () => {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
};
