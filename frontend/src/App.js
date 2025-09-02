import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import PropertyPage from "./pages/PropertyPage";

function App() {
  return (
    <Router>
      <nav style={{ padding: "1rem", background: "#f0f0f0" }}>
        <Link to="/dashboard" style={{ marginRight: "1rem" }}>
          Dashboard
        </Link>
        <Link to="/property">Property Page</Link>
      </nav>

      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/property" element={<PropertyPage />} />
        <Route path="/property/:id" element={<PropertyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
