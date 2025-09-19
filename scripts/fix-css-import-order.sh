#!/bin/bash

# fix-css-import-order.sh - แก้ไขปัญหา @import order ใน CSS
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

# Function to fix CSS import order
fix_css_imports() {
    local css_file="$1"
    
    if [[ ! -f "$css_file" ]]; then
        log_warning "File $css_file not found"
        return 1
    fi
    
    log_info "Fixing CSS imports in $css_file"
    
    # Create backup
    cp "$css_file" "${css_file}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Extract all @import statements
    local imports=$(grep "^@import\|[[:space:]]@import" "$css_file" || true)
    
    if [[ -n "$imports" ]]; then
        # Remove existing @import statements from the file
        sed -i.tmp '/^@import\|[[:space:]]@import.*$/d' "$css_file"
        
        # Create new file with imports at the top
        {
            echo "/* CSS Imports - Must be at the top of the file */"
            echo "$imports"
            echo ""
            cat "$css_file"
        } > "${css_file}.new"
        
        mv "${css_file}.new" "$css_file"
        
        # Clean up
        [[ -f "${css_file}.tmp" ]] && rm "${css_file}.tmp"
        
        log_success "Fixed import order in $css_file"
        return 0
    else
        log_info "No @import statements found in $css_file"
        return 1
    fi
}

# Function to merge CSS files instead of using @import
merge_css_files() {
    local main_css="$1"
    local import_css="$2"
    
    if [[ ! -f "$main_css" ]] || [[ ! -f "$import_css" ]]; then
        log_error "One or both CSS files not found"
        return 1
    fi
    
    log_info "Merging $import_css into $main_css"
    
    # Create backup
    cp "$main_css" "${main_css}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Remove @import statement for the file we're merging
    sed -i.tmp "/import.*$(basename "$import_css")/d" "$main_css"
    
    # Add content from imported file
    {
        # Keep existing imports and initial content
        grep -E "^@import|^@charset" "$main_css" || true
        echo ""
        echo "/* ========== Merged from $(basename "$import_css") ========== */"
        cat "$import_css"
        echo ""
        echo "/* ========== End of merged content ========== */"
        echo ""
        # Add the rest of main CSS (excluding imports we already handled)
        grep -vE "^@import|^@charset" "$main_css" || true
    } > "${main_css}.new"
    
    mv "${main_css}.new" "$main_css"
    
    # Clean up
    [[ -f "${main_css}.tmp" ]] && rm "${main_css}.tmp"
    
    log_success "Merged CSS files successfully"
}

# Main fix function
main() {
    log_info "🔧 Fixing CSS @import order issue..."
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    local main_css="src/styles/global.css"
    local antd_css="src/styles/antd-custom.css"
    
    # Method 1: Try to fix import order
    if [[ -f "$main_css" ]]; then
        if fix_css_imports "$main_css"; then
            log_success "Method 1: Fixed import order"
        else
            log_info "Method 1: No imports to reorder, trying method 2..."
            
            # Method 2: Merge files instead
            if [[ -f "$antd_css" ]]; then
                merge_css_files "$main_css" "$antd_css"
                log_success "Method 2: Merged CSS files"
            else
                log_warning "antd-custom.css not found, creating integrated solution..."
                
                # Method 3: Create integrated CSS
                create_integrated_css "$main_css"
            fi
        fi
    else
        log_warning "global.css not found, checking other files..."
        
        # Check other possible main CSS files
        local css_files=("src/index.css" "src/App.css" "src/main.css")
        
        for css_file in "${css_files[@]}"; do
            if [[ -f "$css_file" ]]; then
                fix_css_imports "$css_file"
            fi
        done
    fi
    
    # Clear cache
    log_info "Clearing build cache..."
    [[ -d "dist" ]] && rm -rf dist
    [[ -d "node_modules/.cache" ]] && rm -rf node_modules/.cache
    [[ -d ".vite" ]] && rm -rf .vite
    
    log_success "Cache cleared"
    
    log_success "🎉 CSS Import Order Fix Complete!"
    echo ""
    log_info "What was done:"
    echo "  ✅ Fixed @import statement order"
    echo "  ✅ Created backup files"
    echo "  ✅ Cleared build cache"
    echo ""
    log_info "Next steps:"
    echo "  1. Try building again: npm run build"
    echo "  2. If successful, test in development: npm run dev"
    echo ""
    log_success "Happy coding! 🎨"
}

# Function to create integrated CSS (Method 3)
create_integrated_css() {
    local main_css="$1"
    
    log_info "Creating integrated CSS solution..."
    
    # Create backup
    [[ -f "$main_css" ]] && cp "$main_css" "${main_css}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Create integrated CSS file
cat > "$main_css" << 'EOF'
/* src/styles/global.css - Integrated with Ant Design */
/* All imports must be at the top */
@import 'tailwindcss/base';
@import 'tailwindcss/components'; 
@import 'tailwindcss/utilities';
@import 'antd/dist/reset.css';

/* Thai Font - Sarabun from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

/* Kid-friendly Font */
@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@300;400;700&display=swap');

/* ========== CSS Variables ========== */
:root {
  /* Primary theme colors */
  --primary-color: #a855f7;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --info-color: #3b82f6;
  
  /* Pastel colors for kid-friendly theme */
  --pastel-pink: #FFE4E1;
  --pastel-purple: #E6E6FA;
  --pastel-blue: #E0E6FF;
  --pastel-cyan: #E0FFFF;
  --pastel-green: #E6FFE6;
  --pastel-yellow: #FFF8DC;
  --pastel-orange: #FFEFD5;
  --pastel-red: #FFEBEE;
}

/* ========== CSS Reset & Base Styles ========== */
@layer base {
  * {
    box-sizing: border-box;
    font-family: 'Sarabun', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply antialiased;
    @apply text-gray-800;
    @apply leading-relaxed;
    min-height: 100vh;
    background: linear-gradient(135deg, #fdf2f8 0%, #f0f9ff 100%);
  }

  /* Headings */
  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold;
    @apply leading-tight;
  }

  /* Links */
  a {
    @apply transition-colors;
    @apply duration-200;
  }

  /* Form Elements */
  input[type="text"],
  input[type="email"], 
  input[type="password"],
  input[type="number"],
  input[type="date"],
  input[type="color"],
  textarea,
  select {
    @apply transition-all;
    @apply duration-200;
    @apply font-thai;
  }

  input[type="text"]:focus,
  input[type="email"]:focus,
  input[type="password"]:focus, 
  input[type="number"]:focus,
  input[type="date"]:focus,
  textarea:focus,
  select:focus {
    @apply outline-none;
    @apply ring-2;
    @apply ring-purple-500;
    @apply border-transparent;
  }

  /* Buttons */
  button {
    @apply transition-all;
    @apply duration-200;
    @apply font-thai;
  }

  button:focus {
    @apply outline-none;
  }
}

/* ========== Component Layer ========== */
@layer components {
  /* Font Families */
  .font-thai {
    font-family: 'Sarabun', sans-serif;
  }

  .font-kid {
    font-family: 'Comic Neue', 'Comic Sans MS', cursive, sans-serif;
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

  /* Pastel backgrounds */
  .bg-pastel-pink {
    background-color: var(--pastel-pink);
  }

  .bg-pastel-purple {
    background-color: var(--pastel-purple);
  }

  .bg-pastel-blue {
    background-color: var(--pastel-blue);
  }

  .bg-pastel-cyan {
    background-color: var(--pastel-cyan);
  }

  .bg-pastel-green {
    background-color: var(--pastel-green);
  }

  .bg-pastel-yellow {
    background-color: var(--pastel-yellow);
  }

  .bg-pastel-orange {
    background-color: var(--pastel-orange);
  }

  .bg-pastel-red {
    background-color: var(--pastel-red);
  }

  /* Rainbow gradient backgrounds */
  .bg-rainbow {
    background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #fcea2b, #ff9ff3);
  }

  .bg-rainbow-pastel {
    background: linear-gradient(135deg, var(--pastel-pink), var(--pastel-purple), var(--pastel-blue), var(--pastel-cyan), var(--pastel-green), var(--pastel-yellow));
  }

  /* Kid-friendly styles */
  .kid-button {
    @apply bg-gradient-to-r;
    @apply from-yellow-400;
    @apply to-orange-400;
    @apply hover:from-yellow-500;
    @apply hover:to-orange-500;
    @apply text-white;
    @apply font-bold;
    @apply text-lg;
    @apply px-8;
    @apply py-4;
    @apply rounded-2xl;
    @apply transform;
    @apply transition-all;
    @apply duration-200;
    @apply hover:scale-105;
    @apply shadow-lg;
    @apply hover:shadow-xl;
    @apply font-kid;
  }

  .kid-card {
    @apply bg-white;
    @apply rounded-3xl;
    @apply shadow-xl;
    @apply border-4;
    @apply border-purple-200;
    @apply transform;
    @apply transition-all;
    @apply duration-300;
    @apply hover:scale-105;
    @apply hover:shadow-2xl;
  }
}

/* ========== Ant Design Customizations ========== */

/* Button overrides */
.ant-btn {
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.ant-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ant-btn-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, #d946ef 100%);
  border: none;
}

.ant-btn-primary:hover,
.ant-btn-primary:focus {
  background: linear-gradient(135deg, #9333ea 0%, #c026d3 100%);
}

/* Card overrides */
.ant-card {
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
}

/* Avatar overrides */
.ant-avatar {
  border: 3px solid #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.ant-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
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
}

/* Modal overrides */
.ant-modal-content {
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.ant-modal-header {
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  border-bottom: 2px solid #f0f0f0;
}

.ant-modal-title {
  font-weight: 700;
  color: #1f2937;
}

/* Form overrides */
.ant-input,
.ant-select-selector {
  border-radius: 12px;
  border: 2px solid #e5e7eb;
}

.ant-input:focus,
.ant-select-selector:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

/* ========== Animations ========== */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-wiggle {
  animation: wiggle 1s ease-in-out;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}

/* ========== Responsive Design ========== */
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

/* ========== Utility Classes ========== */
@layer utilities {
  .safe-top {
    padding-top: env(safe-area-inset-top);
  }

  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .container-responsive {
    @apply w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }

  .text-gradient {
    background: linear-gradient(135deg, var(--primary-color), #d946ef);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .shadow-kid {
    box-shadow: 0 8px 25px rgba(168, 85, 247, 0.2);
  }

  .hover-lift:hover {
    transform: translateY(-4px);
  }
}
EOF

    log_success "Created integrated CSS file"
}

# Run the fix
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi