import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import POS from './pages/POS';
import LogsandRecords from './pages/LogsandRecords';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/Login" element={<LoginPage />} />
      <Route path="/POS" element={<POS />} />
      <Route path="/LogsandRecords" element={<LogsandRecords />} />
      <Route path="/Settings" element={<Settings />} />
    </Routes>
  );
}