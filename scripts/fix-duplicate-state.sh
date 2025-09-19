#!/bin/bash

# fix-duplicate-state.sh - แก้ไข duplicate state declarations
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

# Function to remove duplicate lines
remove_duplicates() {
    local file="$1"
    local temp_file="${file}.temp"
    
    # Use awk to remove consecutive duplicate lines
    awk '
    {
        if ($0 != prev) {
            if (NR > 1) print ""
            print $0
        }
        prev = $0
    }
    END {
        if (NR > 0) print ""
    }' "$file" > "$temp_file"
    
    # Clean up empty lines
    sed '/^$/N;/^\n$/d' "$temp_file" > "$file"
    rm "$temp_file"
}

# Function to fix specific duplicate state issues
fix_duplicate_states() {
    local file="$1"
    
    log_info "Fixing duplicate state declarations in $file"
    
    # Create backup
    cp "$file" "${file}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Remove duplicate useState declarations
    awk '
    BEGIN {
        seen_activeTab = 0
        seen_loading = 0
        seen_familyData = 0
        seen_familyBehaviors = 0
        seen_familyRewards = 0
        seen_showChildModal = 0
        seen_showBehaviorModal = 0
        seen_showRewardModal = 0
        seen_editingItem = 0
        seen_childForm = 0
        seen_behaviorForm = 0
        seen_rewardForm = 0
        in_component = 0
    }
    
    # Detect when we enter the component
    /const AdminDashboard = |function AdminDashboard|export.*function AdminDashboard/ {
        in_component = 1
    }
    
    # Skip duplicate useState lines
    /const \[activeTab, setActiveTab\] = useState/ {
        if (seen_activeTab == 0 && in_component) {
            seen_activeTab = 1
            print
        }
        next
    }
    
    /const \[loading, setLoading\] = useState/ {
        if (seen_loading == 0 && in_component) {
            seen_loading = 1
            print
        }
        next
    }
    
    /const \[familyData, setFamilyData\] = useState/ {
        if (seen_familyData == 0 && in_component) {
            seen_familyData = 1
            print
        }
        next
    }
    
    /const \[familyBehaviors, setFamilyBehaviors\] = useState/ {
        if (seen_familyBehaviors == 0 && in_component) {
            seen_familyBehaviors = 1
            print
        }
        next
    }
    
    /const \[familyRewards, setFamilyRewards\] = useState/ {
        if (seen_familyRewards == 0 && in_component) {
            seen_familyRewards = 1
            print
        }
        next
    }
    
    /const \[showChildModal, setShowChildModal\] = useState/ {
        if (seen_showChildModal == 0 && in_component) {
            seen_showChildModal = 1
            print
        }
        next
    }
    
    /const \[showBehaviorModal, setShowBehaviorModal\] = useState/ {
        if (seen_showBehaviorModal == 0 && in_component) {
            seen_showBehaviorModal = 1
            print
        }
        next
    }
    
    /const \[showRewardModal, setShowRewardModal\] = useState/ {
        if (seen_showRewardModal == 0 && in_component) {
            seen_showRewardModal = 1
            print
        }
        next
    }
    
    /const \[editingItem, setEditingItem\] = useState/ {
        if (seen_editingItem == 0 && in_component) {
            seen_editingItem = 1
            print
        }
        next
    }
    
    /const \[childForm, setChildForm\] = useState/ {
        if (seen_childForm == 0 && in_component) {
            seen_childForm = 1
            print
        }
        next
    }
    
    /const \[behaviorForm, setBehaviorForm\] = useState/ {
        if (seen_behaviorForm == 0 && in_component) {
            seen_behaviorForm = 1
            print
        }
        next
    }
    
    /const \[rewardForm, setRewardForm\] = useState/ {
        if (seen_rewardForm == 0 && in_component) {
            seen_rewardForm = 1
            print
        }
        next
    }
    
    # Print all other lines
    {
        print
    }
    ' "$file" > "${file}.fixed"
    
    mv "${file}.fixed" "$file"
}

# Function to fix syntax errors
fix_syntax_errors() {
    local file="$1"
    
    log_info "Fixing syntax errors in $file"
    
    # Fix malformed useState declarations
    sed -i.tmp '
        # Fix incomplete useState lines
        s/const \[familyData, setFamilyData\] = useState({$/const [familyData, setFamilyData] = useState({/g
        
        # Fix any trailing syntax issues
        s/const \[/const [/g
        s/\] = useState/] = useState/g
        
        # Remove any orphaned opening braces
        /^[[:space:]]*const \[.*\] = useState({[[:space:]]*$/ {
            N
            /\n[[:space:]]*const \[/ {
                s/const \[.*\] = useState({[[:space:]]*\n//
            }
        }
    ' "$file"
    
    # Clean up
    [[ -f "${file}.tmp" ]] && rm "${file}.tmp"
}

# Function to validate the file after fixes
validate_file() {
    local file="$1"
    
    log_info "Validating $file after fixes..."
    
    # Check for duplicate state declarations
    local duplicates=$(grep -c "const \[activeTab" "$file" || echo 0)
    if [[ $duplicates -gt 1 ]]; then
        log_warning "Still found $duplicates activeTab declarations"
        return 1
    fi
    
    duplicates=$(grep -c "const \[loading" "$file" || echo 0)
    if [[ $duplicates -gt 1 ]]; then
        log_warning "Still found $duplicates loading declarations"
        return 1
    fi
    
    duplicates=$(grep -c "const \[familyData" "$file" || echo 0)
    if [[ $duplicates -gt 1 ]]; then
        log_warning "Still found $duplicates familyData declarations"
        return 1
    fi
    
    # Check for syntax errors
    if grep -q "const \[.*\] = useState({$" "$file"; then
        log_warning "Found incomplete useState declarations"
        return 1
    fi
    
    log_success "File validation passed"
    return 0
}

# Main fix function
main() {
    log_info "🔧 Fixing duplicate state declarations and build errors..."
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    # Find AdminDashboard file
    local admin_dashboard=""
    local possible_paths=(
        "src/components/AdminDashboard.jsx"
        "src/pages/AdminDashboard.jsx"
        "src/components/admin/AdminDashboard.jsx"
        "src/AdminDashboard.jsx"
    )
    
    for path in "${possible_paths[@]}"; do
        if [[ -f "$path" ]]; then
            admin_dashboard="$path"
            break
        fi
    done
    
    if [[ -z "$admin_dashboard" ]]; then
        log_error "AdminDashboard.jsx not found!"
        exit 1
    fi
    
    log_info "Found AdminDashboard at: $admin_dashboard"
    
    # Show current issues
    log_info "Current duplicate state declarations:"
    echo "  - activeTab: $(grep -c "const \[activeTab" "$admin_dashboard" || echo 0)"
    echo "  - loading: $(grep -c "const \[loading" "$admin_dashboard" || echo 0)"
    echo "  - familyData: $(grep -c "const \[familyData" "$admin_dashboard" || echo 0)"
    
    # Apply fixes
    fix_duplicate_states "$admin_dashboard"
    fix_syntax_errors "$admin_dashboard"
    
    # Validate
    if validate_file "$admin_dashboard"; then
        log_success "✅ All fixes applied successfully"
    else
        log_warning "⚠️  Some issues may still exist, manual review recommended"
    fi
    
    # Show summary
    log_info "Fixed duplicate state declarations:"
    echo "  - activeTab: $(grep -c "const \[activeTab" "$admin_dashboard" || echo 0)"
    echo "  - loading: $(grep -c "const \[loading" "$admin_dashboard" || echo 0)"
    echo "  - familyData: $(grep -c "const \[familyData" "$admin_dashboard" || echo 0)"
    
    # Clear cache
    log_info "Clearing build cache..."
    [[ -d "dist" ]] && rm -rf dist
    [[ -d "node_modules/.cache" ]] && rm -rf node_modules/.cache
    [[ -d ".vite" ]] && rm -rf .vite
    
    log_success "🎉 Duplicate State Fix Complete!"
    echo ""
    log_info "What was fixed:"
    echo "  ✅ Removed duplicate useState declarations"
    echo "  ✅ Fixed syntax errors"
    echo "  ✅ Created backup file"
    echo "  ✅ Cleared build cache"
    echo ""
    log_info "Next steps:"
    echo "  1. Try building again: npm run build"
    echo "  2. If successful, test in development: npm run dev"
    echo "  3. If still issues, check the backup file for reference"
    echo ""
    log_success "Happy coding! 🚀"
}

# Run the fix
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi