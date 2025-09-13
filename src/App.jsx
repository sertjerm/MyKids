// src/App.jsx
// อัปเดตใช้ API ใหม่และ Hooks ใหม่ - รองรับ ActivityDebugComponent

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Settings, Users, Baby, AlertCircle, CheckCircle, RefreshCw, Home } from "lucide-react";

// Import Components
import ChildDashboard from "./pages/ChildDashboard";
import Dashboard from "./pages/Dashboard"; // Main Admin Dashboard page
import AdminDashboard from "./components/admin/AdminDashboard"; // Admin Component

// Import Hooks และ API ใหม่
import { useApiStatus, useLocalStorageState } from "./hooks/useApi";
import api from "./services/api";

// Helper component เพื่อ handle redirect อย่างถูกต้อง
const RedirectToChild = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // navigate จะใช้ relative path ตาม basename ที่ตั้งไว้
    navigate("/child", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-600">กำลังเปลี่ยนหน้า...</p>
      </div>
    </div>
  );
};

const App = () => {
  const [currentView, setCurrentView] = useState("child");
  const [selectedChild, setSelectedChild] = useLocalStorageState("selectedChild", "C001");
  
  // ใช้ custom hooks ใหม่
  const { status, statusData, checkStatus, isConnected, isError } = useApiStatus();

  // ตรวจสอบ base path สำหรับทุก environment
  const getBasePath = () => {
    // ใช้ environment variable หรือ default
    return import.meta.env.VITE_BASE_PATH || "/mykids";
  };

  // Navigation Component
  const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // กำหนด active view จาก current path
    useEffect(() => {
      if (location.pathname.includes("/admin") || location.pathname === "/") {
        setCurrentView("admin");
      } else {
        setCurrentView("child");
      }
    }, [location.pathname]);

    const handleViewChange = (view) => {
      setCurrentView(view);
      if (view === "admin") {
        navigate("/admin");
      } else {
        navigate(selectedChild ? `/child/${selectedChild}` : "/child");
      }
    };

    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-2">
          {/* API Status Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              isConnected
                ? "bg-green-100 text-green-800 border border-green-200"
                : isError
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-yellow-100 text-yellow-800 border border-yellow-200"
            }`}
            title={statusData?.message || status}
          >
            {isConnected ? (
              <CheckCircle className="w-4 h-4" />
            ) : isError ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <RefreshCw className="w-4 h-4 animate-spin" />
            )}
            <span className="hidden sm:inline">
              {isConnected
                ? "API เชื่อมต่อแล้ว"
                : isError
                ? "API ขัดข้อง"
                : "กำลังตรวจสอบ..."}
            </span>
            {/* Refresh button */}
            <button
              onClick={checkStatus}
              className="ml-1 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              title="รีเฟรชสถานะ API"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* View Toggle Buttons */}
          <div className="flex bg-white rounded-lg shadow-lg border overflow-hidden">
            <button
              onClick={() => handleViewChange("child")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${
                currentView === "child"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Baby className="w-4 h-4" />
              <span className="hidden sm:inline">เด็ก</span>
            </button>

            <button
              onClick={() => handleViewChange("admin")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${
                currentView === "admin"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>

          {/* Home Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">หน้าหลัก</span>
          </button>
        </div>
      </div>
    );
  };

  // Loading Component
  const Loading = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-solid border-blue-500 border-r-transparent mb-4"></div>
        <div className="text-2xl font-bold text-gray-800 mb-2">🌈 MyKids</div>
        <p className="text-lg text-gray-700">กำลังโหลด...</p>
        {!isConnected && (
          <div className="mt-4 p-4 bg-white bg-opacity-80 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">กำลังตรวจสอบการเชื่อมต่อ API</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Error Component
  const ErrorPage = ({ error, onRetry }) => (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-pink-100 to-purple-100 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h1 className="text-2xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h1>
        <p className="text-gray-600 mb-6">{error || "ไม่สามารถเชื่อมต่อกับระบบได้"}</p>
        
        <div className="space-y-3">
          <button 
            onClick={onRetry}
            className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            ลองใหม่อีกครั้ง
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            รีเฟรชหน้าเว็บ
          </button>
        </div>

        {/* Debug info in development */}
        {import.meta.env.DEV && statusData && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">ข้อมูล Debug</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto text-left">
              {JSON.stringify(statusData, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );

  // Main App Component
  return (
    <Router basename={getBasePath()}>
      <div className="App">
        <Navigation />

        {/* Show loading while checking API status */}
        {status === 'checking' && <Loading />}
        
        {/* Show error if API fails */}
        {isError && (
          <ErrorPage 
            error={statusData?.error || "ไม่สามารถเชื่อมต่อกับ API ได้"} 
            onRetry={checkStatus} 
          />
        )}

        {/* Show app routes when API is connected */}
        {isConnected && (
          <Routes>
            {/* Root path - redirect to main admin dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Child Dashboard Routes */}
            <Route
              path="/child"
              element={<ChildDashboard childId={selectedChild} />}
            />
            <Route 
              path="/child/:childId" 
              element={<ChildDashboard />} 
            />

            {/* Fallback route - redirect to main dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}

        {/* Enhanced Debug Info - only show in development */}
        {import.meta.env.DEV && (
          <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded-lg font-mono z-40 max-w-sm">
            <div className="text-green-400 font-bold mb-2">🔍 Debug Info</div>
            <div>Mode: {import.meta.env.MODE}</div>
            <div>Prod: {import.meta.env.PROD ? 'Yes' : 'No'}</div>
            <div>API: {status}</div>
            <div>Base: {getBasePath()}</div>
            <div>View: {currentView}</div>
            <div>Child: {selectedChild}</div>
            <div>Time: {new Date().toLocaleTimeString('th-TH')}</div>
            {/* แสดงข้อมูลเพิ่มเติมเมื่อมี error */}
            {statusData?.error && (
              <div className="mt-2 p-2 bg-red-800 bg-opacity-50 rounded">
                <div className="text-red-300 font-semibold">API Error:</div>
                <div className="text-red-100 text-xs">{statusData.error}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;