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
import AppCliente from './app-cliente-v5';
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registrazione" element={<Registrazione />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPrenoty /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminGuard><DashboardAdmin /></AdminGuard>} />
      <Route path="/blocco" element={<BloccoAbbonamento />} />
      <Route path="/:slug" element={<AppCliente />} />
    </Routes>
  </BrowserRouter>
);
