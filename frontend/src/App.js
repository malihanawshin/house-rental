import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import PropertyPage from "./pages/PropertyPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/property" element={<PropertyPage />} />
        <Route path="/property/:id" element={<PropertyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
