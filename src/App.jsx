import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import ChildDashboard from './pages/ChildDashboard';
import Navigation from './components/common/Navigation';

function App() {
  const [currentView, setCurrentView] = useState('admin');
  const [selectedChild, setSelectedChild] = useState(null);

  // Auto-detect basename from current URL
  const getBasename = () => {
    const path = window.location.pathname;
    
    // For development (localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '/';
    }
    
    // For production - detect if in subdirectory
    if (path.includes('/my-kids')) {
      return '/my-kids';
    }
    
    // Default fallback
    return '/';
  };

  const basename = getBasename();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-pastel-purple to-pastel-blue">
      <Router basename={basename}>
        <div className="container mx-auto px-4 py-8">
          <Navigation 
            currentView={currentView} 
            setCurrentView={setCurrentView}
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
          />
          
          <Routes>
            <Route 
              path="/" 
              element={
                currentView === 'admin' ? 
                <AdminDashboard /> : 
                <ChildDashboard childId={selectedChild} />
              } 
            />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/child/:childId" element={<ChildDashboard />} />
            
            {/* Catch all route */}
            <Route path="*" element={
              <div className="text-center py-12">
                <div className="card-pastel max-w-md mx-auto">
                  <h1 className="text-2xl font-bold text-primary-700 mb-4">
                    🌈 MyKids
                  </h1>
                  <p className="text-gray-600 mb-4">กำลังโหลดหรือหน้าที่ไม่พบ</p>
                  <div className="text-sm text-gray-500 mb-4">
                    Current path: {window.location.pathname}<br/>
                    Basename: {basename}
                  </div>
                  <button 
                    onClick={() => window.location.href = basename === '/' ? '/' : basename + '/'}
                    className="btn-pastel bg-primary-500 text-white"
                  >
                    กลับหน้าหลัก
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
