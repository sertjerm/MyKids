import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import ChildDashboard from './pages/ChildDashboard';
import Navigation from './components/common/Navigation';

function App() {
  const [currentView, setCurrentView] = useState('admin'); // 'admin' or 'child'
  const [selectedChild, setSelectedChild] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-pastel-purple to-pastel-blue">
      <Router>
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
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
