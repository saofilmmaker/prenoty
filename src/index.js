import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './home';
import DashboardPrenoty from './dashboard-prenoty-v5';
import DashboardAdmin from './dashboard-admin-v2';
import AdminGuard from './admin-guard';
import BloccoAbbonamento from './blocco-abbonamento-v2';
import Login from './login';
import Registrazione from './registrazione';
import RecuperaPassword from './recupera-password';
import NuovaPassword from './nuova-password';
import AppCliente from './app-cliente-v5';
import { PrivacyPolicy, TerminiServizio, CookiePolicy } from './legal';
import { supabase } from './supabase';
import { useState, useEffect } from 'react';

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);
  if (session === undefined) return null;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

window.__BUILD__ = process.env.REACT_APP_BUILD || "dev";

// Registra Service Worker per PWA offline-ready (iOS + Android)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registrazione" element={<Registrazione />} />
      <Route path="/recupera-password" element={<RecuperaPassword />} />
      <Route path="/nuova-password" element={<NuovaPassword />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPrenoty /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminGuard><DashboardAdmin /></AdminGuard>} />
      <Route path="/blocco" element={<BloccoAbbonamento />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/termini-di-servizio" element={<TerminiServizio />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/:slug" element={<AppCliente />} />
    </Routes>
  </BrowserRouter>
);
