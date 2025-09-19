#!/bin/bash

# fix-production-build-corrected.sh - แก้ไข production build vendor error (Fixed Version)
# สำหรับโปรเจค My-Kids Management System

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to fix package.json manually (avoiding npm pkg set JSON issues)
fix_production_package_json() {
    log_info "📦 Fixing package.json for production build..."
    
    # Create backup
    cp "package.json" "package.json.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Use node to modify package.json safely
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Fix scripts
        pkg.scripts = pkg.scripts || {};
        pkg.scripts.build = 'vite build';
        pkg.scripts.preview = 'vite preview';
        pkg.scripts['build:prod'] = 'npm run build && npm run preview';
        
        // Add overrides to prevent version conflicts
        pkg.overrides = pkg.overrides || {};
        pkg.overrides.react = '^19.1.1';
        pkg.overrides['react-dom'] = '^19.1.1';
        pkg.overrides['@types/react'] = '^19.1.10';
        pkg.overrides['@types/react-dom'] = '^19.1.7';
        
        // Set engine requirements
        pkg.engines = pkg.engines || {};
        pkg.engines.node = '>=16.0.0';
        pkg.engines.npm = '>=8.0.0';
        
        // Write back to file
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        console.log('✅ Successfully updated package.json');
    " 2>/dev/null || {
        log_warning "Node.js method failed, using manual approach..."
        
        # Fallback: just update critical scripts
        if command -v jq >/dev/null 2>&1; then
            # Use jq if available
            jq '.scripts.build = "vite build" | .scripts.preview = "vite preview" | .scripts["build:prod"] = "npm run build && npm run preview"' package.json > package.json.tmp && mv package.json.tmp package.json
            log_success "Updated package.json with jq"
        else
            # Manual sed approach
            sed -i.bak 's/"build":.*/"build": "vite build",/' package.json
            log_success "Updated build script manually"
        fi
    }
    
    log_success "Fixed package.json for production"
}

# Function to create production-safe vite config
create_production_vite_config() {
    log_info "📝 Creating production-safe Vite configuration..."
    
    # Create backup
    if [[ -f "vite.config.js" ]]; then
        cp "vite.config.js" "vite.config.js.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
cat > "vite.config.js" << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,tsx}",
    })
  ],
  
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
    
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes('react')) {
            return 'react-vendor'
          }
          
          // Ant Design
          if (id.includes('antd') || id.includes('@ant-design')) {
            return 'antd-vendor'
          }
          
          // Icons
          if (id.includes('lucide-react') || id.includes('icon')) {
            return 'icons-vendor'
          }
          
          // Router
          if (id.includes('router')) {
            return 'router-vendor'
          }
          
          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },
    
    chunkSizeWarningLimit: 1000
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'antd',
      'lucide-react',
      '@ant-design/icons'
    ]
  },
  
  define: {
    'process.env': {},
    'global': 'globalThis'
  }
})
EOF

    log_success "Created production-safe vite.config.js"
}

# Function to clean and reinstall
clean_and_reinstall() {
    log_info "🧹 Clean installation for production..."
    
    # Remove build artifacts
    log_info "Removing old files..."
    rm -rf node_modules package-lock.json yarn.lock pnpm-lock.yaml
    rm -rf .vite dist .cache
    
    # Clear npm cache
    log_info "Clearing npm cache..."
    npm cache clean --force 2>/dev/null || log_warning "Failed to clear npm cache"
    
    # Install packages
    log_info "Installing packages (this may take a few minutes)..."
    if NODE_ENV=production npm install --legacy-peer-deps --no-audit --no-fund; then
        log_success "Packages installed successfully"
    else
        log_warning "Standard install failed, trying alternative method..."
        npm install --force --no-audit --no-fund
    fi
}

# Function to create error-safe main entry
create_error_safe_main() {
    log_info "🚪 Creating error-safe main entry point..."
    
    local main_file="src/main.jsx"
    
    # Create backup if exists
    if [[ -f "$main_file" ]]; then
        cp "$main_file" "${main_file}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    mkdir -p src
    
cat > "$main_file" << 'EOF'
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
EOF

    log_success "Created error-safe main entry point"
}

# Function to build and test production
build_and_test_production() {
    log_info "🏗️  Building for production..."
    
    # Clean previous build
    rm -rf dist
    
    # Set environment variables
    export NODE_ENV=production
    export VITE_BUILD_MODE=production
    
    # Run the build
    log_info "Running vite build..."
    if npm run build; then
        log_success "✅ Production build successful!"
        
        # Check build output
        if [[ -d "dist" ]]; then
            local total_size=$(du -sh dist 2>/dev/null | cut -f1 || echo "unknown")
            local js_count=$(find dist -name "*.js" 2>/dev/null | wc -l || echo 0)
            local css_count=$(find dist -name "*.css" 2>/dev/null | wc -l || echo 0)
            
            echo ""
            echo "📊 Build Statistics:"
            echo "  📁 Total size: $total_size"
            echo "  📜 JavaScript files: $js_count"
            echo "  🎨 CSS files: $css_count"
            
            # Show key files
            echo ""
            echo "🔑 Key generated files:"
            find dist -name "index*.js" -o -name "index*.css" 2>/dev/null | head -5 | sed 's|^dist/||' | sed 's/^/  - /'
            
            # Check for common issues
            if [[ -f "dist/index.html" ]]; then
                log_success "✅ index.html generated"
            else
                log_warning "⚠️ index.html missing!"
            fi
            
            if [[ $(find dist -name "*.js" | wc -l) -gt 0 ]]; then
                log_success "✅ JavaScript bundles generated"
            else
                log_error "❌ No JavaScript files found!"
            fi
            
        else
            log_error "❌ dist folder not created!"
            return 1
        fi
        
        # Test preview server
        log_info "🔍 Testing production preview server..."
        if command -v timeout >/dev/null; then
            timeout 8s npm run preview >/dev/null 2>&1 &
            local preview_pid=$!
            sleep 3
            
            if kill -0 $preview_pid 2>/dev/null; then
                log_success "✅ Preview server starts successfully"
                echo "🌐 Test at: http://localhost:4173"
                kill $preview_pid 2>/dev/null || true
            else
                log_warning "⚠️ Preview server may have issues"
            fi
            
            wait $preview_pid 2>/dev/null || true
        else
            log_info "Preview test skipped (timeout not available)"
        fi
        
        return 0
        
    else
        log_error "❌ Build failed!"
        echo ""
        echo "🔍 Build troubleshooting:"
        echo "  1. Check for TypeScript/JavaScript errors"
        echo "  2. Verify all imports are correct"
        echo "  3. Run 'npm run dev' to see detailed errors"
        echo "  4. Check if all dependencies are installed"
        
        return 1
    fi
}

# Function to show deployment instructions
show_deployment_guide() {
    log_info "🚀 Deployment Guide"
    
    echo ""
    echo "📦 Your production build is ready in ./dist/"
    echo ""
    echo "🌐 To deploy to your web server:"
    echo "  1. Upload ALL contents of ./dist/ to your web root directory"
    echo "  2. Ensure your web server is configured for Single Page Application (SPA)"
    echo "  3. Set proper MIME types for static files"
    echo ""
    echo "⚙️ Server Configuration Examples:"
    echo ""
    echo "📄 Apache (.htaccess in web root):"
    echo "RewriteEngine On"
    echo "RewriteBase /"
    echo "RewriteRule ^index\\.html\$ - [L]"
    echo "RewriteCond %{REQUEST_FILENAME} !-f"
    echo "RewriteCond %{REQUEST_FILENAME} !-d"
    echo "RewriteRule . /index.html [L]"
    echo ""
    echo "🌐 Nginx (in server block):"
    echo "location / {"
    echo "    try_files \$uri \$uri/ /index.html;"
    echo "}"
    echo ""
    echo "🔗 Your production URL: https://sertjerm.com/mykids/"
    echo ""
    echo "✅ After deployment:"
    echo "  - Clear any CDN cache"
    echo "  - Test the live site"
    echo "  - Check browser console for errors"
}

# Main function
main() {
    log_info "🔧 Fixing production build vendor errors... (Corrected Version)"
    
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    echo ""
    echo "🚨 PRODUCTION BUILD FIX 🚨"
    echo ""
    echo "This will fix and rebuild your application for production:"
    echo "  ✅ Fix Vite configuration issues"
    echo "  ✅ Fix package.json configuration"
    echo "  ✅ Clean install all dependencies"
    echo "  ✅ Create error-resistant entry point"
    echo "  ✅ Build and test production bundle"
    echo "  ✅ Provide deployment instructions"
    echo ""
    
    # Show current status
    if [[ -d "dist" ]]; then
        echo "📁 Current dist/ will be replaced"
    fi
    if [[ -d "node_modules" ]]; then
        echo "📦 node_modules will be reinstalled"
    fi
    echo ""
    
    read -p "Continue with production build fix? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Operation cancelled by user"
        exit 0
    fi
    
    # Execute fix steps
    create_production_vite_config
    fix_production_package_json
    clean_and_reinstall
    create_error_safe_main
    
    if build_and_test_production; then
        show_deployment_guide
        
        log_success "🎉 PRODUCTION BUILD FIX COMPLETED! 🎉"
        echo ""
        log_info "Next steps:"
        echo "  1. 🧪 Test locally: npm run preview"
        echo "  2. 📤 Upload dist/ contents to your server"
        echo "  3. ⚙️  Configure server for SPA routing"
        echo "  4. 🌐 Test your live site: https://sertjerm.com/mykids/"
        echo "  5. 🗑️  Clear CDN/browser caches"
        echo ""
        log_success "Your application should now work without vendor errors! 🚀"
        
    else
        log_error "Build failed. Please fix the errors and try again."
        exit 1
    fi
}

# Run the script
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi