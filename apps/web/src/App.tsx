import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { EditorPage } from "@/pages/EditorPage";
import { LandingPage } from "@/pages/LandingPage";
import { SalarySlipPage } from "@/pages/SalarySlipPage";

function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pdf-editor" element={<EditorPage />} />
        <Route path="/salary-slip" element={<SalarySlipPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
