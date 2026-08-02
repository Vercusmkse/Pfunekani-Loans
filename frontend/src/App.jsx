import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import LandingPage from "./components/landing/LandingPage";
import AuthModal from "./components/auth/AuthModal";
import ClientDashboard from "./components/client/ClientDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";

function MainShellRouter() {
  const { currentUser } = useApp();
  const [authPortalView, setAuthPortalView] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {!currentUser ? (
          <LandingPage onOpenAuth={(viewType) => setAuthPortalView(viewType)} />
        ) : currentUser.role === "admin" ? (
          <AdminDashboard />
        ) : (
          <ClientDashboard />
        )}
      </main>

      {authPortalView && (
        <AuthModal
          defaultRole={authPortalView}
          onClose={() => setAuthPortalView(null)}
        />
      )}

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainShellRouter />
    </AppProvider>
  );
}
