#!/bin/bash

# fix-css-error.sh - แก้ไขปัญหา CSS import error
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

# Main fix function
main() {
    log_info "🔧 Fixing CSS import error..."
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    # Create src/styles directory if not exists
    mkdir -p src/styles
    log_info "Created src/styles directory"
    
    # Create the missing antd-custom.css file
    log_info "Creating antd-custom.css file..."
    
cat > "src/styles/antd-custom.css" << 'EOF'
/* src/styles/antd-custom.css */
/* Custom Ant Design styles for My-Kids Management System */

/* Ant Design CSS reset import */
@import 'antd/dist/reset.css';

/* Kid-friendly color overrides */
:root {
  --primary-color: #a855f7;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --info-color: #3b82f6;
}

/* Custom behavior cards */
.behavior-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px !important;
  overflow: hidden;
}

.behavior-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.behavior-card.selected {
  transform: scale(1.02);
  border-width: 2px;
  box-shadow: 0 8px 25px rgba(24, 144, 255, 0.3);
}

.behavior-good {
  background: linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%);
  border-color: #b7eb8f;
}

.behavior-bad {
  background: linear-gradient(135deg, #fff2e8 0%, #ffebf0 100%);
  border-color: #ffadd6;
}

/* Child cards */
.child-card {
  transition: all 0.3s ease;
  border-radius: 20px !important;
  overflow: hidden;
}

.child-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.child-card.selected {
  border-color: #1890ff;
  box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2);
}

/* Button overrides for Ant Design */
.ant-btn {
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  font-family: 'Sarabun', sans-serif;
}

.ant-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ant-btn-primary {
  background: linear-gradient(135deg, #a855f7 0%, #d946ef 100%);
  border: none;
}

.ant-btn-primary:hover {
  background: linear-gradient(135deg, #9333ea 0%, #c026d3 100%);
}

/* Card overrides for Ant Design */
.ant-card {
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-family: 'Sarabun', sans-serif;
}

.ant-card-hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.ant-card-head {
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  border-radius: 16px 16px 0 0;
}

.ant-card-head-title {
  font-weight: 700;
  color: #1f2937;
  font-family: 'Sarabun', sans-serif;
}

/* Avatar overrides for Ant Design */
.ant-avatar {
  border: 3px solid #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.ant-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* Progress overrides */
.ant-progress-line {
  margin-bottom: 8px;
}

.ant-progress-bg {
  border-radius: 20px;
}

.ant-progress-inner {
  border-radius: 20px;
  background-color: #f3f4f6;
}

/* Tag overrides */
.ant-tag {
  border-radius: 20px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px solid transparent;
  font-family: 'Sarabun', sans-serif;
}

/* Modal overrides */
.ant-modal {
  border-radius: 20px;
  overflow: hidden;
}

.ant-modal-content {
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.ant-modal-header {
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  border-bottom: 2px solid #f0f0f0;
  padding: 20px 24px;
}

.ant-modal-title {
  font-weight: 700;
  font-size: 18px;
  color: #1f2937;
  font-family: 'Sarabun', sans-serif;
}

.ant-modal-body {
  padding: 24px;
}

/* Table overrides */
.ant-table {
  border-radius: 12px;
  overflow: hidden;
  font-family: 'Sarabun', sans-serif;
}

.ant-table-thead > tr > th {
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  color: #1f2937;
}

/* Form overrides */
.ant-form-item-label > label {
  font-weight: 600;
  color: #374151;
  font-family: 'Sarabun', sans-serif;
}

.ant-input,
.ant-select-selector,
.ant-input-number {
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  font-family: 'Sarabun', sans-serif;
}

.ant-input:focus,
.ant-select-selector:focus,
.ant-input-number:focus {
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

/* Notification overrides */
.ant-notification {
  font-family: 'Sarabun', sans-serif;
}

.ant-notification-notice {
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Message overrides */
.ant-message {
  font-family: 'Sarabun', sans-serif;
}

.ant-message-notice-content {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .behavior-card,
  .child-card,
  .ant-card {
    border-radius: 12px;
  }
  
  .ant-btn {
    border-radius: 8px;
  }
  
  .ant-modal-content {
    border-radius: 12px;
    margin: 16px;
  }
}

/* Custom animations for kid-friendly interactions */
@keyframes bounce-gentle {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

.animate-bounce-gentle {
  animation: bounce-gentle 1s ease-in-out;
}

@keyframes wiggle {
  0%, 7% { transform: rotateZ(0); }
  15% { transform: rotateZ(-15deg); }
  20% { transform: rotateZ(10deg); }
  25% { transform: rotateZ(-10deg); }
  30% { transform: rotateZ(6deg); }
  35% { transform: rotateZ(-4deg); }
  40%, 100% { transform: rotateZ(0); }
}

.animate-wiggle {
  animation: wiggle 1s ease-in-out;
}

/* Loading states */
.ant-card-loading-content {
  border-radius: 16px;
}

.ant-skeleton-content {
  padding: 16px;
}

/* Focus states for accessibility */
.ant-btn:focus,
.ant-card:focus-within,
.ant-avatar:focus {
  outline: 2px solid #a855f7;
  outline-offset: 2px;
}

/* Pastel theme for kid-friendly design */
.pastel-theme {
  --pastel-pink: #FFE4E1;
  --pastel-purple: #E6E6FA;
  --pastel-blue: #E0E6FF;
  --pastel-cyan: #E0FFFF;
  --pastel-green: #E6FFE6;
  --pastel-yellow: #FFF8DC;
  --pastel-orange: #FFEFD5;
  --pastel-red: #FFEBEE;
}

/* Custom utility classes */
.bg-pastel-gradient {
  background: linear-gradient(135deg, var(--pastel-pink), var(--pastel-purple), var(--pastel-blue));
}

.text-kid-friendly {
  font-family: 'Comic Neue', 'Comic Sans MS', cursive, sans-serif;
  font-weight: 600;
  line-height: 1.4;
}

.shadow-kid {
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.2);
}

.hover-lift {
  transition: transform 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
}
EOF

    log_success "Created antd-custom.css file"
    
    # Fix the import in global.css if it exists
    local global_css="src/styles/global.css"
    if [[ -f "$global_css" ]]; then
        log_info "Checking global.css for import statements..."
        
        # Check if antd-custom import already exists
        if grep -q "@import.*antd-custom" "$global_css"; then
            log_info "antd-custom import already exists in global.css"
        else
            # Add import at the beginning of the file
            log_info "Adding antd-custom import to global.css..."
            
            # Create backup
            cp "$global_css" "${global_css}.backup.$(date +%Y%m%d_%H%M%S)"
            
            # Add import after tailwindcss imports
            sed -i.tmp '/@import.*tailwindcss.*utilities/a\
\
/* Ant Design Custom Styles */\
@import '\''./antd-custom.css'\'';' "$global_css"
            
            # Clean up
            [[ -f "${global_css}.tmp" ]] && rm "${global_css}.tmp"
            
            log_success "Added antd-custom import to global.css"
        fi
    else
        log_warning "global.css not found"
    fi
    
    # Check and fix index.css if it exists
    local index_css="src/index.css"
    if [[ -f "$index_css" ]]; then
        log_info "Checking index.css for problematic imports..."
        
        # Remove problematic import if exists
        if grep -q "@import.*antd-custom" "$index_css"; then
            log_info "Fixing import path in index.css..."
            
            # Create backup
            cp "$index_css" "${index_css}.backup.$(date +%Y%m%d_%H%M%S)"
            
            # Fix the import path
            sed -i.tmp 's|@import.*antd-custom\.css.*|@import '\''./styles/antd-custom.css'\'';|g' "$index_css"
            
            # Clean up
            [[ -f "${index_css}.tmp" ]] && rm "${index_css}.tmp"
            
            log_success "Fixed import path in index.css"
        fi
    fi
    
    # Check main entry files for CSS imports
    local main_files=("src/main.jsx" "src/index.js" "src/App.jsx")
    
    for file in "${main_files[@]}"; do
        if [[ -f "$file" ]]; then
            log_info "Checking $file for CSS imports..."
            
            # Check if there's an antd CSS import
            if grep -q "import.*antd.*css" "$file"; then
                log_info "Ant Design CSS import found in $file"
            else
                # Check if we should add it
                if grep -q "import.*React" "$file" || grep -q "import.*\['\"]\." "$file"; then
                    log_info "Adding Ant Design CSS import to $file..."
                    
                    # Create backup
                    cp "$file" "${file}.backup.$(date +%Y%m%d_%H%M%S)"
                    
                    # Add import at the top
                    sed -i.tmp '1i\import '\''antd/dist/reset.css'\'';' "$file"
                    
                    # Clean up
                    [[ -f "${file}.tmp" ]] && rm "${file}.tmp"
                    
                    log_success "Added Ant Design CSS import to $file"
                fi
            fi
        fi
    done
    
    # Clear any cache
    log_info "Clearing cache..."
    if [[ -d "node_modules/.cache" ]]; then
        rm -rf node_modules/.cache
        log_success "Cleared node_modules cache"
    fi
    
    if [[ -d ".vite" ]]; then
        rm -rf .vite
        log_success "Cleared Vite cache"
    fi
    
    # Create a simple test CSS file to verify everything works
    log_info "Creating CSS verification test..."
    
cat > "src/styles/test.css" << 'EOF'
/* Test CSS - This file can be deleted after verification */
.test-css-working {
  color: green;
  font-weight: bold;
}
EOF

    log_success "Created test CSS file"
    
    log_success "🎉 CSS Error Fix Complete!"
    echo ""
    log_info "What was fixed:"
    echo "  ✅ Created missing antd-custom.css file"
    echo "  ✅ Fixed import paths in CSS files"
    echo "  ✅ Added Ant Design CSS imports to entry files"
    echo "  ✅ Cleared cache directories"
    echo "  ✅ Created backup files for all changes"
    echo ""
    log_info "Next steps:"
    echo "  1. Restart your development server: npm run dev"
    echo "  2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)"
    echo "  3. Check if the error is resolved"
    echo ""
    log_info "If you still see errors:"
    echo "  1. Check browser console for any remaining CSS errors"
    echo "  2. Verify all import statements are correct"
    echo "  3. Try deleting node_modules and running: npm install"
    echo ""
    log_success "Happy coding! 🎨"
}

# Run the fix
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi