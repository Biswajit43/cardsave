import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "./components/BottomNav.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import GlobalSearch from "./components/GlobalSearch.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useVault } from "./context/VaultContext.jsx";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import Vault from "./pages/Vault.jsx";
import Activity from "./pages/Activity.jsx";
import Profile from "./pages/Profile.jsx";
import About from "./pages/About.jsx";

function VaultBootstrap({ children }) {
  const { user } = useAuth();
  const { refreshAll } = useVault();

  useEffect(() => {
    if (user) refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return children;
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function AppShell() {
  const location = useLocation();
  const hideNav = ["/login", "/signup"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-base pb-24">
      <div className="mx-auto max-w-md">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <VaultBootstrap>
                    <PageTransition>
                      <Home />
                    </PageTransition>
                  </VaultBootstrap>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vault"
              element={
                <ProtectedRoute>
                  <VaultBootstrap>
                    <PageTransition>
                      <Vault />
                    </PageTransition>
                  </VaultBootstrap>
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <ProtectedRoute>
                  <VaultBootstrap>
                    <PageTransition>
                      <Activity />
                    </PageTransition>
                  </VaultBootstrap>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <VaultBootstrap>
                    <PageTransition>
                      <Profile />
                    </PageTransition>
                  </VaultBootstrap>
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <About />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
      {!hideNav && <BottomNav />}
      {!hideNav && <GlobalSearch />}
    </div>
  );
}

export default function App() {
  return <AppShell />;
}
