import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import OwnerDashboard from "./pages/OwnerDashboard";
import POS from "./pages/POS";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/records" element={<POS />} />
        <Route path="/settings" element={<POS />} />
      </Routes>
    </Router>
  );
}

export default App;
