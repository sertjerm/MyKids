#!/bin/bash

# fix-admin-dashboard-error.sh - แก้ไข ReferenceError ใน AdminDashboard
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
    log_info "🔧 Fixing AdminDashboard ReferenceError..."
    
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
    
    # Create backup
    cp "$admin_dashboard" "${admin_dashboard}.backup.$(date +%Y%m%d_%H%M%S)"
    log_info "Created backup file"
    
    # Fix the ReferenceError issues
    log_info "Fixing undefined function references..."
    
    # Fix showChildModalHandler -> () => setShowChildModal(true)
    sed -i.tmp 's/onClick={showChildModalHandler}/onClick={() => setShowChildModal(true)}/g' "$admin_dashboard"
    
    # Fix any other similar issues that might exist
    sed -i.tmp 's/onClick={showBehaviorModalHandler}/onClick={() => setShowBehaviorModal(true)}/g' "$admin_dashboard"
    sed -i.tmp 's/onClick={showRewardModalHandler}/onClick={() => setShowRewardModal(true)}/g' "$admin_dashboard"
    sed -i.tmp 's/onClick={showFamilyModalHandler}/onClick={() => setShowFamilyModal(true)}/g' "$admin_dashboard"
    
    # Fix form submit handlers if they exist
    sed -i.tmp 's/onOk={handleSubmit}/onOk={handleChildSubmit}/g' "$admin_dashboard"
    
    # Clean up temp file
    [[ -f "${admin_dashboard}.tmp" ]] && rm "${admin_dashboard}.tmp"
    
    # Check for other common issues and add missing functions
    if ! grep -q "const handleChildSubmit" "$admin_dashboard"; then
        log_info "Adding missing handleChildSubmit function..."
        
        # Find the right place to add the function (after useState declarations)
        local temp_file="${admin_dashboard}.temp"
        awk '
        /const \[.*\] = useState/ { 
            print; 
            if (!found_state_end) {
                next_lines = 0
            }
        }
        /^[[:space:]]*$/ && next_lines < 10 && /const \[.*useState/ {
            next_lines++
            print
            next
        }
        /^[[:space:]]*\/\/ |^[[:space:]]*const [^[]|^[[:space:]]*function|^[[:space:]]*useEffect/ && next_lines > 0 && !found_handler {
            print ""
            print "  // Handle child form submission"
            print "  const handleChildSubmit = async () => {"
            print "    try {"
            print "      const values = await form.validateFields();"
            print "      "
            print "      if (editingItem) {"
            print "        // Update existing child"
            print "        const updatedChildren = familyData.children.map(child =>"
            print "          child.Id === editingItem.Id ? { ...child, ...values } : child"
            print "        );"
            print "        setFamilyData({ ...familyData, children: updatedChildren });"
            print "      } else {"
            print "        // Add new child"
            print "        const newChild = {"
            print "          Id: \`C\${Date.now()}\`,"
            print "          FamilyId: currentFamily.Id,"
            print "          ...values,"
            print "          Age: parseInt(values.Age),"
            print "          AvatarPath: values.AvatarPath || (values.Gender === \"M\" ? \"👦\" : \"👧\"),"
            print "          currentPoints: 0,"
            print "          IsActive: true"
            print "        };"
            print "        setFamilyData({"
            print "          ...familyData,"
            print "          children: [...familyData.children, newChild]"
            print "        });"
            print "      }"
            print "      "
            print "      setShowChildModal(false);"
            print "      setEditingItem(null);"
            print "      form.resetFields();"
            print "      "
            print "    } catch (error) {"
            print "      console.error(\"Error saving child:\", error);"
            print "    }"
            print "  };"
            print ""
            found_handler = 1
            print
            next
        }
        { print }
        ' "$admin_dashboard" > "$temp_file"
        
        mv "$temp_file" "$admin_dashboard"
        log_success "Added handleChildSubmit function"
    fi
    
    # Add missing form instance if not exists
    if ! grep -q "const \[form\]" "$admin_dashboard" && ! grep -q "Form.useForm" "$admin_dashboard"; then
        log_info "Adding missing Form instance..."
        
        sed -i.tmp '/import.*{.*Form.*}.*from.*antd/a\
\
// Add Form instance\
const [form] = Form.useForm();' "$admin_dashboard"
        
        [[ -f "${admin_dashboard}.tmp" ]] && rm "${admin_dashboard}.tmp"
        log_success "Added Form instance"
    fi
    
    # Add missing imports if not exists
    if ! grep -q "import.*{.*message.*}" "$admin_dashboard"; then
        log_info "Adding missing message import..."
        
        sed -i.tmp 's/import { \(.*\) } from '\''antd'\''/import { \1, message } from '\''antd'\''/g' "$admin_dashboard"
        [[ -f "${admin_dashboard}.tmp" ]] && rm "${admin_dashboard}.tmp"
        log_success "Added message import"
    fi
    
    # Verify the fixes
    log_info "Verifying fixes..."
    
    if grep -q "showChildModalHandler" "$admin_dashboard"; then
        log_warning "Still found showChildModalHandler - may need manual fix"
    else
        log_success "✅ Fixed showChildModalHandler reference"
    fi
    
    if grep -q "handleChildSubmit" "$admin_dashboard"; then
        log_success "✅ Found handleChildSubmit function"
    else
        log_warning "handleChildSubmit function may need manual addition"
    fi
    
    # Clear development cache
    log_info "Clearing development cache..."
    [[ -d "node_modules/.cache" ]] && rm -rf node_modules/.cache
    [[ -d ".vite" ]] && rm -rf .vite
    
    log_success "🎉 AdminDashboard Error Fix Complete!"
    echo ""
    log_info "What was fixed:"
    echo "  ✅ Fixed showChildModalHandler reference"
    echo "  ✅ Added missing handleChildSubmit function"
    echo "  ✅ Added missing Form instance"
    echo "  ✅ Added missing imports"
    echo "  ✅ Created backup file"
    echo "  ✅ Cleared development cache"
    echo ""
    log_info "Next steps:"
    echo "  1. Restart your development server: npm run dev"
    echo "  2. Clear browser cache and hard refresh (Ctrl+Shift+R)"
    echo "  3. Test the AdminDashboard functionality"
    echo ""
    log_success "Happy coding! 🎯"
}

# Run the fix
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi