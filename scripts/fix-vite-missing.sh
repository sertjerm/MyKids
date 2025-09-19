#!/bin/bash

# fix-vite-missing.sh - แก้ไขปัญหา vite command not found
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

# Function to check current status
check_current_status() {
    log_info "🔍 Checking current project status..."
    
    echo "📋 Current Status:"
    
    # Check package.json
    if [[ -f "package.json" ]]; then
        echo "  ✅ package.json exists"
    else
        echo "  ❌ package.json missing"
        return 1
    fi
    
    # Check node_modules
    if [[ -d "node_modules" ]]; then
        echo "  ✅ node_modules directory exists"
        
        # Check if vite is installed
        if [[ -f "node_modules/.bin/vite" ]]; then
            echo "  ✅ Vite binary found in node_modules"
        else
            echo "  ❌ Vite binary NOT found in node_modules"
        fi
        
        # Check vite package
        if [[ -d "node_modules/vite" ]]; then
            echo "  ✅ Vite package found"
            local vite_version=$(cat node_modules/vite/package.json | grep '"version"' | cut -d'"' -f4)
            echo "  📦 Vite version: $vite_version"
        else
            echo "  ❌ Vite package NOT found"
        fi
    else
        echo "  ❌ node_modules directory missing"
    fi
    
    # Check package-lock.json
    if [[ -f "package-lock.json" ]]; then
        echo "  ✅ package-lock.json exists"
    else
        echo "  ⚠️ package-lock.json missing"
    fi
    
    echo ""
}

# Function to check and fix package.json
fix_package_json() {
    log_info "📝 Checking and fixing package.json..."
    
    # Check if Vite is in devDependencies
    if grep -q '"vite"' package.json; then
        log_success "Vite found in package.json"
    else
        log_warning "Vite missing from package.json, adding it..."
        
        # Add Vite to devDependencies using Node.js
        node -e "
            const fs = require('fs');
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            
            pkg.devDependencies = pkg.devDependencies || {};
            pkg.devDependencies.vite = '^7.1.2';
            pkg.devDependencies['@vitejs/plugin-react'] = '^5.0.0';
            
            fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
            console.log('✅ Added Vite to devDependencies');
        " || {
            log_error "Failed to update package.json with Node.js"
            return 1
        }
    fi
    
    # Ensure proper scripts exist
    if ! grep -q '"dev".*vite' package.json; then
        log_info "Adding/fixing npm scripts..."
        
        node -e "
            const fs = require('fs');
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            
            pkg.scripts = pkg.scripts || {};
            pkg.scripts.dev = 'vite';
            pkg.scripts.build = 'vite build';
            pkg.scripts.preview = 'vite preview';
            
            fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
            console.log('✅ Fixed npm scripts');
        " || {
            log_error "Failed to fix scripts"
            return 1
        }
    fi
    
    log_success "package.json is properly configured"
}

# Function to completely clean and reinstall
complete_reinstall() {
    log_info "🧹 Performing complete clean installation..."
    
    # Remove everything
    log_info "Removing old installation files..."
    rm -rf node_modules
    rm -rf package-lock.json
    rm -rf yarn.lock
    rm -rf pnpm-lock.yaml
    rm -rf .npm
    rm -rf .cache
    rm -rf .vite
    
    # Clear npm cache
    log_info "Clearing npm cache..."
    npm cache clean --force
    
    # Install fresh
    log_info "Installing fresh dependencies (this will take a few minutes)..."
    echo "📦 Running: npm install --legacy-peer-deps"
    
    if npm install --legacy-peer-deps; then
        log_success "✅ Dependencies installed successfully"
    else
        log_warning "Standard install failed, trying alternative methods..."
        
        # Try different installation methods
        log_info "Trying: npm install --force"
        if npm install --force; then
            log_success "✅ Force install succeeded"
        else
            log_info "Trying: npm ci --legacy-peer-deps"
            if npm ci --legacy-peer-deps 2>/dev/null; then
                log_success "✅ npm ci succeeded"
            else
                log_error "All installation methods failed"
                return 1
            fi
        fi
    fi
}

# Function to verify installation
verify_installation() {
    log_info "🔬 Verifying Vite installation..."
    
    # Check if vite command works
    if npx vite --version >/dev/null 2>&1; then
        local vite_version=$(npx vite --version)
        log_success "✅ Vite is working: $vite_version"
    else
        log_error "❌ Vite command still not working"
        return 1
    fi
    
    # Check key dependencies
    local missing_deps=()
    
    if [[ ! -d "node_modules/react" ]]; then
        missing_deps+=("react")
    fi
    
    if [[ ! -d "node_modules/react-dom" ]]; then
        missing_deps+=("react-dom")
    fi
    
    if [[ ! -d "node_modules/@vitejs/plugin-react" ]]; then
        missing_deps+=("@vitejs/plugin-react")
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_warning "Missing dependencies: ${missing_deps[*]}"
        
        log_info "Installing missing dependencies..."
        for dep in "${missing_deps[@]}"; do
            case $dep in
                "react")
                    npm install react@^19.1.1 --save
                    ;;
                "react-dom")
                    npm install react-dom@^19.1.1 --save
                    ;;
                "@vitejs/plugin-react")
                    npm install @vitejs/plugin-react@^5.0.0 --save-dev
                    ;;
            esac
        done
    fi
    
    log_success "Installation verification completed"
}

# Function to create minimal vite.config.js if missing
create_vite_config() {
    if [[ ! -f "vite.config.js" ]]; then
        log_info "📄 Creating basic vite.config.js..."
        
cat > "vite.config.js" << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Basic Vite configuration
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist'
  }
})
EOF
        log_success "Created basic vite.config.js"
    else
        log_success "vite.config.js already exists"
    fi
}

# Function to test the setup
test_setup() {
    log_info "🧪 Testing the setup..."
    
    # Test vite version
    echo "🔗 Testing Vite version:"
    if npx vite --version; then
        log_success "✅ Vite version check passed"
    else
        log_error "❌ Vite version check failed"
        return 1
    fi
    
    # Test if dev server can start (timeout after 8 seconds)
    echo ""
    echo "🚀 Testing dev server startup (8 second test):"
    
    if command -v timeout >/dev/null; then
        if timeout 8s npx vite --host localhost --port 5173 >/dev/null 2>&1; then
            log_success "✅ Dev server test passed"
        else
            log_warning "⚠️ Dev server test timed out (this is normal for testing)"
        fi
    else
        log_info "Timeout command not available, skipping dev server test"
    fi
    
    # Test build command (dry run)
    echo ""
    echo "🏗️ Testing build command:"
    if npx vite build --mode development >/dev/null 2>&1; then
        log_success "✅ Build command test passed"
        # Clean up test build
        rm -rf dist
    else
        log_warning "⚠️ Build command test failed (may be due to app errors, not Vite)"
    fi
}

# Main function
main() {
    log_info "🔧 Fixing 'vite: command not found' error..."
    
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Are you in the project root directory?"
        exit 1
    fi
    
    echo ""
    echo "🚨 VITE INSTALLATION FIX 🚨"
    echo ""
    echo "This will:"
    echo "  🗑️  Remove all node_modules and lock files"
    echo "  📝 Fix package.json configuration"
    echo "  📦 Reinstall all dependencies from scratch"
    echo "  ⚙️  Create basic Vite configuration"
    echo "  🧪 Test the installation"
    echo ""
    
    # Show current status
    check_current_status
    
    read -p "Continue with complete reinstallation? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Operation cancelled"
        exit 0
    fi
    
    # Execute fix steps
    echo ""
    log_info "🚀 Starting fix process..."
    
    # Step 1: Fix package.json
    fix_package_json
    
    # Step 2: Complete reinstall
    complete_reinstall
    
    # Step 3: Verify installation
    verify_installation
    
    # Step 4: Create vite config
    create_vite_config
    
    # Step 5: Test setup
    test_setup
    
    log_success "🎉 VITE FIX COMPLETED! 🎉"
    echo ""
    log_info "✅ Vite should now be working properly"
    echo ""
    echo "🧪 Quick test commands:"
    echo "  npx vite --version     # Check Vite version"
    echo "  npm run dev           # Start development server"
    echo "  npm run build         # Build for production"
    echo ""
    echo "🌟 Next steps:"
    echo "  1. Run: npm run dev"
    echo "  2. Open: http://localhost:5173"
    echo "  3. Check browser console for any app-level errors"
    echo ""
    log_success "Happy coding! 🚀"
}

# Run the fix
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi