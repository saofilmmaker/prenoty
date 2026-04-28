import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPrenoty from './dashboard-prenoty-v5';
import DashboardAdmin from './dashboard-admin-v2';
import AppCliente from './app-cliente-v5';
import BloccoAbbonamento from './blocco-abbonamento-v2';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AppCliente />} />
      <Route path="/dashboard" element={<DashboardPrenoty />} />
      <Route path="/admin" element={<DashboardAdmin />} />
      <Route path="/blocco" element={<BloccoAbbonamento />} />
    </Routes>
  </BrowserRouter>
);
