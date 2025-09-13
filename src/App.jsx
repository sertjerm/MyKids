import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Settings, Users, Baby, AlertCircle, CheckCircle } from "lucide-react";
import ChildDashboard from "./pages/ChildDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import { useApiStatus } from "./hooks/useApi";

// Helper component เพื่อ handle redirect อย่างถูกต้อง
const RedirectToChild = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // navigate จะใช้ relative path ตาม basename ที่ตั้งไว้
    navigate("/child", { replace: true });
  }, [navigate]);

  return <div>กำลังเปลี่ยนหน้า...</div>;
};

const App = () => {
  const [currentView, setCurrentView] = useState("child");
  const [selectedChild, setSelectedChild] = useState("C001");
  const { status, statusData, checkStatus } = useApiStatus();

  // ตรวจสอบ base path สำหรับทุก environment
  const getBasePath = () => {
    return "/mykids"; // ใช้เหมือนกันทั้ง dev และ prod
  };

  // Check API status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Navigation Component
  const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // กำหนด active view จาก current path
    useEffect(() => {
      if (location.pathname.includes("/admin")) {
        setCurrentView("admin");
      } else {
        setCurrentView("child");
      }
    }, [location.pathname]);

    return (
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
              onClick={() => {
                setCurrentView("child");
                navigate("/child");
              }}
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
              onClick={() => {
                setCurrentView("admin");
                navigate("/admin");
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                currentView === "admin"
                  ? "bg-purple-600 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading Component
  const Loading = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="mt-4 text-lg text-gray-700">กำลังโหลด MyKids...</p>
      </div>
    </div>
  );

  // Main App Component
  return (
    <Router basename={getBasePath()}>
      <div className="App">
        <Navigation />

        <Routes>
          {/* Root path - redirect to child dashboard */}
          <Route path="/" element={<RedirectToChild />} />

          {/* Child Dashboard Routes */}
          <Route
            path="/child"
            element={<ChildDashboard childId={selectedChild} />}
          />
          <Route path="/child/:childId" element={<ChildDashboard />} />

          {/* Admin Dashboard Route */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Fallback route - redirect to child instead of 404 */}
          <Route path="*" element={<RedirectToChild />} />
        </Routes>

        {/* Debug Info - only show in development */}
        {import.meta.env.DEV && (
          <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded-lg font-mono z-50">
            <div>Mode: {import.meta.env.MODE}</div>
            <div>Prod: {import.meta.env.PROD ? "true" : "false"}</div>
            <div>Base: {getBasePath() || "/"}</div>
            <div>API: {import.meta.env.VITE_API_URL || "not set"}</div>
            <div>Status: {status}</div>
            <div>Path: {window.location.pathname}</div>
          </div>
        )}
      </div>
    </Router>
  );
};

// Error Boundary Wrapper
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-100 via-pink-100 to-purple-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              เกิดข้อผิดพลาด
            </h2>
            <p className="text-gray-600 mb-4">
              ขออภัย เกิดข้อผิดพลาดในการโหลดแอพพลิเคชัน
            </p>
            <details className="mb-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                รายละเอียดข้อผิดพลาด
              </summary>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {this.state.error?.message || "Unknown error"}
              </pre>
            </details>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              โหลดใหม่
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export with Error Boundary
export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
