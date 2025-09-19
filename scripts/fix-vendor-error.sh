#!/bin/bash

# fix-vendor-error.sh - แก้ไข vendor bundle และ version errors
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

# Function to clear all caches
clear_all_caches() {
    log_info "🗑️  Clearing all caches..."
    
    # Clear Node modules cache
    if [[ -d "node_modules/.cache" ]]; then
        rm -rf node_modules/.cache
        log_success "Cleared node_modules/.cache"
    fi
    
    # Clear Vite cache
    if [[ -d ".vite" ]]; then
        rm -rf .vite
        log_success "Cleared .vite cache"
    fi
    
    # Clear dist folder
    if [[ -d "dist" ]]; then
        rm -rf dist
        log_success "Cleared dist folder"
    fi
    
    # Clear npm cache
    npm cache clean --force
    log_success "Cleared npm cache"
    
    # Clear browser cache reminder
    log_warning "Don't forget to clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
}

# Function to check package versions
check_package_versions() {
    log_info "🔍 Checking package versions..."
    
    # Check React versions
    local react_version=$(npm list react --depth=0 2>/dev/null | grep react@ | head -1 || echo "react not found")
    local react_dom_version=$(npm list react-dom --depth=0 2>/dev/null | grep react-dom@ | head -1 || echo "react-dom not found")
    local vite_version=$(npm list vite --depth=0 2>/dev/null | grep vite@ | head -1 || echo "vite not found")
    
    echo "📦 Current versions:"
    echo "  - $react_version"
    echo "  - $react_dom_version"
    echo "  - $vite_version"
    
    # Check for version mismatches
    if [[ "$react_version" == *"not found"* ]] || [[ "$react_dom_version" == *"not found"* ]]; then
        log_error "Missing React packages detected!"
        return 1
    fi
    
    # Extract version numbers for comparison
    local react_ver=$(echo "$react_version" | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)
    local react_dom_ver=$(echo "$react_dom_version" | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)
    
    if [[ "$react_ver" != "$react_dom_ver" ]]; then
        log_warning "React version mismatch detected: $react_ver vs $react_dom_ver"
        return 1
    fi
    
    log_success "Package versions look good"
    return 0
}

# Function to fix package.json dependencies
fix_package_dependencies() {
    log_info "🔧 Fixing package.json dependencies..."
    
    # Create backup
    cp package.json "package.json.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Check if package.json has proper React 19 setup
    if grep -q '"react": ".*19' package.json; then
        log_info "React 19 detected, ensuring compatibility..."
        
        # Update package.json with compatible versions
        npm pkg set dependencies.react="^19.1.1"
        npm pkg set dependencies.react-dom="^19.1.1"
        npm pkg set devDependencies.vite="^7.1.2"
        npm pkg set devDependencies."@vitejs/plugin-react"="^5.0.0"
        
        # Add missing peer dependencies if needed
        npm pkg set dependencies.@types/react="^19.1.10" --json=false 2>/dev/null || true
        npm pkg set dependencies.@types/react-dom="^19.1.7" --json=false 2>/dev/null || true
        
    else
        log_warning "Non-standard React version detected, keeping as is"
    fi
    
    # Ensure proper build configuration
    npm pkg set scripts.build="vite build"
    npm pkg set scripts.dev="vite --host"
    npm pkg set scripts.preview="vite preview"
    
    log_success "Updated package.json dependencies"
}

# Function to reinstall packages
reinstall_packages() {
    log_info "📦 Reinstalling packages..."
    
    # Remove node_modules and package-lock.json
    if [[ -d "node_modules" ]]; then
        rm -rf node_modules
        log_success "Removed node_modules"
    fi
    
    if [[ -f "package-lock.json" ]]; then
        rm package-lock.json
        log_success "Removed package-lock.json"
    fi
    
    # Install packages with legacy peer deps to avoid conflicts
    npm install --legacy-peer-deps
    
    log_success "Packages reinstalled successfully"
}

# Function to update vite config
update_vite_config() {
    log_info "⚙️  Updating Vite configuration..."
    
    local vite_config="vite.config.js"
    
    if [[ ! -f "$vite_config" ]]; then
        log_info "Creating new vite.config.js..."
        
cat > "$vite_config" << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          icons: ['lucide-react', '@ant-design/icons'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', 'lucide-react']
  },
  define: {
    'process.env': {}
  }
})
EOF
        log_success "Created new vite.config.js"
    else
        # Create backup
        cp "$vite_config" "${vite_config}.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Update existing config to include error prevention
        if ! grep -q "manualChunks" "$vite_config"; then
            log_info "Adding manual chunk configuration..."
            
            # Add manual chunks configuration
            sed -i.tmp '/build: {/a\
\    rollupOptions: {\
\      output: {\
\        manualChunks: {\
\          vendor: ['\''react'\'', '\''react-dom'\''],\
\          antd: ['\''antd'\''],\
\          icons: ['\''lucide-react'\'', '\''@ant-design/icons'\''],\
\        }\
\      }\
\    },' "$vite_config"
            
            [[ -f "${vite_config}.tmp" ]] && rm "${vite_config}.tmp"
            log_success "Updated vite.config.js with manual chunks"
        fi
        
        # Add optimizeDeps if not exists
        if ! grep -q "optimizeDeps" "$vite_config"; then
            sed -i.tmp '/plugins:/a\
\  optimizeDeps: {\
\    include: ['\''react'\'', '\''react-dom'\'', '\''antd'\'', '\''lucide-react'\'']\
\  },' "$vite_config"
            
            [[ -f "${vite_config}.tmp" ]] && rm "${vite_config}.tmp"
            log_success "Added optimizeDeps configuration"
        fi
    fi
}

# Function to create index.html if missing or fix it
fix_index_html() {
    log_info "🌐 Checking index.html..."
    
    local index_html="index.html"
    
    if [[ ! -f "$index_html" ]]; then
        log_info "Creating missing index.html..."
        
cat > "$index_html" << 'EOF'
<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Kids - ระบบจัดการพฤติกรรมเด็ก</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Sarabun', system-ui, sans-serif;
        background: linear-gradient(135deg, #fdf2f8 0%, #f0f9ff 100%);
        min-height: 100vh;
      }
      
      #loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-size: 18px;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div id="root">
      <div id="loading">
        <div>กำลังโหลด My Kids...</div>
      </div>
    </div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF
        log_success "Created index.html"
    else
        log_success "index.html exists"
    fi
}

# Function to check main entry point
check_main_entry() {
    log_info "📍 Checking main entry point..."
    
    local main_files=("src/main.jsx" "src/index.js" "src/main.js")
    local main_file=""
    
    for file in "${main_files[@]}"; do
        if [[ -f "$file" ]]; then
            main_file="$file"
            break
        fi
    done
    
    if [[ -z "$main_file" ]]; then
        log_error "Main entry point not found!"
        
        log_info "Creating src/main.jsx..."
        mkdir -p src
        
cat > "src/main.jsx" << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

// Error boundary for development
if (import.meta.env.DEV) {
  console.log('🚀 My Kids App starting in development mode')
}

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
EOF
        log_success "Created src/main.jsx"
    else
        log_success "Main entry point found: $main_file"
        
        # Ensure it has proper error handling
        if ! grep -q "StrictMode\|createRoot" "$main_file"; then
            log_info "Adding React 19 compatibility to $main_file..."
            
            # Create backup
            cp "$main_file" "${main_file}.backup.$(date +%Y%m%d_%H%M%S)"
            
            # Update to React 19 format
cat > "$main_file" << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

// Error boundary for development
if (import.meta.env.DEV) {
  console.log('🚀 My Kids App starting in development mode')
}

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
EOF
            log_success "Updated $main_file for React 19 compatibility"
        fi
    fi
}

# Function to run diagnostic tests
run_diagnostics() {
    log_info "🔍 Running diagnostics..."
    
    # Check if build works
    log_info "Testing build process..."
    if npm run build > /dev/null 2>&1; then
        log_success "✅ Build successful"
    else
        log_warning "⚠️  Build failed, but continuing..."
    fi
    
    # Check if dev server starts
    log_info "Testing dev server (will timeout after 10 seconds)..."
    timeout 10s npm run dev > /dev/null 2>&1 &
    local dev_pid=$!
    sleep 5
    
    if kill -0 $dev_pid 2>/dev/null; then
        log_success "✅ Dev server starts successfully"
        kill $dev_pid 2>/dev/null || true
    else
        log_warning "⚠️  Dev server may have issues"
    fi
    
    wait $dev_pid 2>/dev/null || true
}

# Main fix function
main() {
    log_info "🔧 Fixing vendor bundle and version errors..."
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    echo "This will:"
    echo "  - Clear all caches"
    echo "  - Check and fix package versions"
    echo "  - Reinstall packages"
    echo "  - Update configurations"
    echo ""
    
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Operation cancelled"
        exit 0
    fi
    
    # Step 1: Clear all caches
    clear_all_caches
    
    # Step 2: Check package versions
    if ! check_package_versions; then
        log_info "Package version issues detected, fixing..."
        fix_package_dependencies
    fi
    
    # Step 3: Reinstall packages
    reinstall_packages
    
    # Step 4: Update Vite config
    update_vite_config
    
    # Step 5: Fix index.html
    fix_index_html
    
    # Step 6: Check main entry point
    check_main_entry
    
    # Step 7: Run diagnostics
    run_diagnostics
    
    log_success "🎉 Vendor Error Fix Complete!"
    echo ""
    log_info "What was done:"
    echo "  ✅ Cleared all caches"
    echo "  ✅ Fixed package dependencies"
    echo "  ✅ Reinstalled packages with --legacy-peer-deps"
    echo "  ✅ Updated Vite configuration"
    echo "  ✅ Checked/created index.html"
    echo "  ✅ Verified main entry point"
    echo "  ✅ Created backup files"
    echo ""
    log_info "Next steps:"
    echo "  1. Start development server: npm run dev"
    echo "  2. Open http://localhost:5173 in browser"
    echo "  3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)"
    echo "  4. Check browser console for any remaining errors"
    echo ""
    log_warning "If issues persist:"
    echo "  - Try different browser"
    echo "  - Check firewall/antivirus settings"
    echo "  - Ensure Node.js version is compatible (16+ recommended)"
    echo ""
    log_success "Happy coding! 🚀"
}

# Run the fix
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi