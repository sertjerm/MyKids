import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Settings, Users, Baby, AlertCircle, CheckCircle } from "lucide-react";
import ChildDashboard from "./pages/ChildDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import { useApiStatus } from "./hooks/useApi";


const App = () => {
  const [currentView, setCurrentView] = useState("child");
  const [selectedChild, setSelectedChild] = useState("C001");
  const { status, statusData, checkStatus } = useApiStatus();

  // Check API status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Navigation Component
  const Navigation = () => (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2">
        {/* API Status Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
            status === "connected"
              ? "bg-green-100 text-green-800 border border-green-200"
              : status === "error"
              ? "bg-red-100 text-red-800 border border-red-200"
              : "bg-yellow-100 text-yellow-800 border border-yellow-200"
          }`}
        >
          {status === "connected" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {status === "connected"
              ? "API เชื่อมต่อแล้ว"
              : status === "error"
              ? "API ขัดข้อง"
              : "กำลังตรวจสอบ..."}
          </span>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex bg-white rounded-lg shadow-lg border overflow-hidden">
          <button
            onClick={() => setCurrentView("child")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              currentView === "child"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Baby className="w-4 h-4" />
            <span className="hidden sm:inline">เด็ก</span>
          </button>

          <button
            onClick={() => setCurrentView("admin")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              currentView === "admin"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">ผู้ดูแล</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Error Boundary Component
  const ErrorFallback = ({ error, resetError }) => (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <div className="space-y-2">
          <button
            onClick={resetError}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ลองใหม่
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            รีเฟรชหน้า
          </button>
        </div>
      </div>
    </div>
  );

  // API Connection Error
  if (status === "error" && !statusData) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ไม่สามารถเชื่อมต่อ API ได้
          </h2>
          <p className="text-gray-600 mb-4">
            กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่
          </p>
          <div className="space-y-2">
            <button
              onClick={checkStatus}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ตรวจสอบการเชื่อมต่อ
            </button>
            <div className="text-xs text-gray-500 mt-2">
              API URL: {import.meta.env.VITE_API_URL}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navigation />

        <ErrorBoundary fallback={ErrorFallback}>
          <Routes>
            {/* Child Routes */}
            <Route
              path="/child"
              element={<ChildDashboard childId={selectedChild} />}
            />
            <Route path="/child/:childId" element={<ChildDashboard />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Default Route */}
            <Route
              path="/"
              element={
                currentView === "admin" ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/child" replace />
                )
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>

        {/* Debug Info (Development Only) */}
        {import.meta.env.VITE_DEBUG === "true" && (
          <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded font-mono">
            <div>ENV: {import.meta.env.VITE_ENV}</div>
            <div>API: {import.meta.env.VITE_API_URL}</div>
            <div>Status: {status}</div>
            <div>View: {currentView}</div>
          </div>
        )}
      </div>
    </Router>
  );
};

// Simple Error Boundary Class Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback({
        error: this.state.error,
        resetError: () => this.setState({ hasError: false, error: null }),
      });
    }

    return this.props.children;
  }
}

export default App;
