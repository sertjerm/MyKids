import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Import styles
try {
  await import('./styles/global.css')
} catch (error) {
  console.warn('Failed to load global styles:', error)
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Application Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'Sarabun, system-ui, sans-serif',
          textAlign: 'center',
          padding: '20px',
          background: 'linear-gradient(135deg, #fdf2f8 0%, #f0f9ff 100%)'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            maxWidth: '500px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😔</div>
            <h1 style={{ 
              color: '#ef4444', 
              marginBottom: '16px',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              เกิดข้อผิดพลาด
            </h1>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              แอปพลิเคชัน My-Kids พบข้อผิดพลาดที่ไม่คาดคิด<br/>
              กรุณาลองรีโหลดหน้าเว็บใหม่
            </p>
            <button
              onClick={() => {
                window.location.reload()
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#a855f7',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#9333ea'
                e.target.style.transform = 'translateY(-1px)'
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#a855f7'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              🔄 รีโหลดหน้า
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Safe app initialization
function initializeApp() {
  try {
    const container = document.getElementById('root')
    
    if (!container) {
      throw new Error('Root container not found')
    }
    
    // Show loading while initializing
    container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Sarabun, sans-serif;">
        <div style="text-align: center;">
          <div style="font-size: 24px; margin-bottom: 16px;">🌈</div>
          <div style="color: #6b7280;">กำลังโหลด My Kids...</div>
        </div>
      </div>
    `
    
    const root = createRoot(container)
    
    root.render(
      <ErrorBoundary>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </ErrorBoundary>
    )
    
    console.log('🚀 My Kids App initialized successfully')
    
  } catch (error) {
    console.error('❌ Failed to initialize app:', error)
    
    // Ultimate fallback
    const container = document.getElementById('root')
    if (container) {
      container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui;">
          <div style="text-align: center; padding: 40px; background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <h1 style="color: #ef4444; margin-bottom: 16px;">ไม่สามารถเริ่มต้นแอปได้</h1>
            <p style="color: #6b7280; margin-bottom: 24px;">กรุณาลองรีโหลดหน้าเว็บ หรือติดต่อผู้ดูแลระบบ</p>
            <button 
              onclick="window.location.reload()" 
              style="padding: 12px 24px; background: #a855f7; color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 16px; font-weight: bold;">
              🔄 รีโหลดหน้า
            </button>
          </div>
        </div>
      `
    }
  }
}

// Initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}
