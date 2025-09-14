// src/App.jsx
import React, { useState } from "react";
import { Users } from "lucide-react";
import mockData, {
  mockFamilies,
  getBehaviorsByFamily,
  getRewardsByFamily,
  getChildrenByFamily,
  calculateCurrentPoints,
  canPerformBehavior,
  canRedeemReward,
} from "./data/mockData";

// Import API service
import api from "./services/api";

// Import components ที่แยกไว้
import Avatar from "./components/Avatar";
import BehaviorCard from "./components/BehaviorCard";
import RewardCard from "./components/RewardCard";
import PointsBadge from "./components/PointsBadge";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import ChildInterface from "./components/ChildInterface";

// Main App Component
function App() {
  const [currentFamily, setCurrentFamily] = useState(null);
  const [currentView, setCurrentView] = useState("login");
  const [selectedChild, setSelectedChild] = useState(null);

  const handleLogin = (family) => {
    setCurrentFamily(family);
    setCurrentView("admin");
  };

  const handleLogout = () => {
    setCurrentFamily(null);
    setCurrentView("login");
    setSelectedChild(null);
  };

  const handleSelectChild = (child) => {
    setSelectedChild(child);
    setCurrentView("child");
  };

  const handleBackToAdmin = () => {
    setCurrentView("admin");
    setSelectedChild(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {currentView === "login" && <LoginPage onLogin={handleLogin} />}

      {currentView === "admin" && currentFamily && (
        <AdminDashboard
          family={currentFamily}
          onLogout={handleLogout}
          onSelectChild={handleSelectChild}
        />
      )}

      {currentView === "child" && currentFamily && selectedChild && (
        <ChildInterface
          family={currentFamily}
          child={selectedChild}
          onBack={handleBackToAdmin}
        />
      )}
    </div>
  );
}

export default App;
