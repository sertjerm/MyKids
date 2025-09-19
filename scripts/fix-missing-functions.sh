#!/bin/bash

# fix-missing-functions.sh - แก้ไข missing functions และ autocomplete warnings
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

# Function to add missing render functions
add_missing_render_functions() {
    local file="$1"
    
    log_info "Adding missing render functions to $file"
    
    # Check if renderChildCard exists
    if ! grep -q "const renderChildCard\|function renderChildCard" "$file"; then
        log_info "Adding missing renderChildCard function..."
        
        # Find where to insert the function (after useState declarations)
        local temp_file="${file}.temp"
        awk '
        /const \[.*\] = useState/ { 
            print
            useState_section = 1
            next
        }
        
        # When we find the end of useState section, add our render functions
        useState_section && (/^[[:space:]]*$/ || /\/\/ |useEffect|const [^[]/) {
            if (!functions_added) {
                print ""
                print "  // === RENDER FUNCTIONS ==="
                print ""
                print "  // Render Child Card"
                print "  const renderChildCard = (child) => {"
                print "    const currentPoints = child.currentPoints || child.CurrentPoints || 0;"
                print "    "
                print "    return ("
                print "      <Card"
                print "        key={child.Id || child.id}"
                print "        hoverable"
                print "        className=\"child-card mb-4\""
                print "        onClick={() => onSelectChild && onSelectChild(child)}"
                print "      >"
                print "        <div className=\"flex items-center gap-4\">"
                print "          <Avatar"
                print "            size={64}"
                print "            src={child.AvatarPath}"
                print "            style={{ backgroundColor: \"#87d068\" }}"
                print "          >"
                print "            {child.AvatarPath || (child.Name ? child.Name[0] : \"?\")}"
                print "          </Avatar>"
                print "          "
                print "          <div className=\"flex-1\">"
                print "            <h3 className=\"text-lg font-bold text-gray-800\">"
                print "              {child.Name}"
                print "            </h3>"
                print "            <p className=\"text-sm text-gray-600\">"
                print "              อายุ {child.Age} ปี"
                print "            </p>"
                print "            <div className=\"flex items-center gap-2 mt-2\">"
                print "              <span className=\"px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-bold\">"
                print "                ⭐ {currentPoints} คะแนน"
                print "              </span>"
                print "            </div>"
                print "          </div>"
                print "          "
                print "          <div className=\"flex flex-col gap-2\">"
                print "            <Button"
                print "              size=\"small\""
                print "              onClick={(e) => {"
                print "                e.stopPropagation();"
                print "                setEditingItem(child);"
                print "                setShowChildModal(true);"
                print "              }}"
                print "            >"
                print "              แก้ไข"
                print "            </Button>"
                print "            <Button"
                print "              size=\"small\""
                print "              danger"
                print "              onClick={(e) => {"
                print "                e.stopPropagation();"
                print "                if (window.confirm(\`ต้องการลบ \${child.Name} หรือไม่?\`)) {"
                print "                  const updatedChildren = familyData.children.filter("
                print "                    (c) => c.Id !== child.Id"
                print "                  );"
                print "                  setFamilyData({ ...familyData, children: updatedChildren });"
                print "                }"
                print "              }}"
                print "            >"
                print "              ลบ"
                print "            </Button>"
                print "          </div>"
                print "        </div>"
                print "      </Card>"
                print "    );"
                print "  };"
                print ""
                print "  // Render Behavior Card"
                print "  const renderBehaviorCard = (behavior) => {"
                print "    const isGood = behavior.Type === \"Good\";"
                print "    "
                print "    return ("
                print "      <Card"
                print "        key={behavior.Id}"
                print "        hoverable"
                print "        className={`behavior-card mb-4 \${isGood ? \"behavior-good\" : \"behavior-bad\"}`}"
                print "        style={{ borderColor: behavior.Color }}"
                print "      >"
                print "        <div className=\"flex items-center gap-4\">"
                print "          <div"
                print "            className=\"w-8 h-8 rounded-full\""
                print "            style={{ backgroundColor: behavior.Color }}"
                print "          />"
                print "          "
                print "          <div className=\"flex-1\">"
                print "            <h3 className=\"text-lg font-bold text-gray-800\">"
                print "              {behavior.Name}"
                print "            </h3>"
                print "            <p className=\"text-sm text-gray-600\">{behavior.Category}</p>"
                print "            <div className=\"flex items-center gap-2 mt-2\">"
                print "              <span"
                print "                className={`px-3 py-1 rounded-full text-sm font-bold text-white \${"
                print "                  isGood"
                print "                    ? \"bg-gradient-to-r from-green-400 to-emerald-500\""
                print "                    : \"bg-gradient-to-r from-red-400 to-pink-500\""
                print "                }`}"
                print "              >"
                print "                {isGood ? \"+\" : \"\"}{behavior.Points} คะแนน"
                print "              </span>"
                print "              {behavior.IsRepeatable && ("
                print "                <span className=\"px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs\">"
                print "                  ทำซ้ำได้"
                print "                </span>"
                print "              )}"
                print "            </div>"
                print "          </div>"
                print "          "
                print "          <div className=\"flex flex-col gap-2\">"
                print "            <Button"
                print "              size=\"small\""
                print "              onClick={() => {"
                print "                setEditingItem(behavior);"
                print "                setBehaviorForm(behavior);"
                print "                setShowBehaviorModal(true);"
                print "              }}"
                print "            >"
                print "              แก้ไข"
                print "            </Button>"
                print "            <Button"
                print "              size=\"small\""
                print "              danger"
                print "              onClick={() => {"
                print "                if (window.confirm(\`ต้องการลบ \${behavior.Name} หรือไม่?\`)) {"
                print "                  const updatedBehaviors = familyBehaviors.filter("
                print "                    (b) => b.Id !== behavior.Id"
                print "                  );"
                print "                  setFamilyBehaviors(updatedBehaviors);"
                print "                }"
                print "              }}"
                print "            >"
                print "              ลบ"
                print "            </Button>"
                print "          </div>"
                print "        </div>"
                print "      </Card>"
                print "    );"
                print "  };"
                print ""
                print "  // Render Reward Card"
                print "  const renderRewardCard = (reward) => {"
                print "    return ("
                print "      <Card"
                print "        key={reward.Id}"
                print "        hoverable"
                print "        className=\"reward-card mb-4\""
                print "        style={{ borderColor: reward.Color }}"
                print "      >"
                print "        <div className=\"flex items-center gap-4\">"
                print "          <div"
                print "            className=\"w-8 h-8 rounded-full\""
                print "            style={{ backgroundColor: reward.Color }}"
                print "          />"
                print "          "
                print "          <div className=\"flex-1\">"
                print "            <h3 className=\"text-lg font-bold text-gray-800\">"
                print "              {reward.Name}"
                print "            </h3>"
                print "            <p className=\"text-sm text-gray-600\">{reward.Category}</p>"
                print "            <div className=\"flex items-center gap-2 mt-2\">"
                print "              <span className=\"px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full text-sm font-bold\">"
                print "                💎 {reward.Cost} คะแนน"
                print "              </span>"
                print "            </div>"
                print "          </div>"
                print "          "
                print "          <div className=\"flex flex-col gap-2\">"
                print "            <Button"
                print "              size=\"small\""
                print "              onClick={() => {"
                print "                setEditingItem(reward);"
                print "                setRewardForm(reward);"
                print "                setShowRewardModal(true);"
                print "              }}"
                print "            >"
                print "              แก้ไข"
                print "            </Button>"
                print "            <Button"
                print "              size=\"small\""
                print "              danger"
                print "              onClick={() => {"
                print "                if (window.confirm(\`ต้องการลบ \${reward.Name} หรือไม่?\`)) {"
                print "                  const updatedRewards = familyRewards.filter("
                print "                    (r) => r.Id !== reward.Id"
                print "                  );"
                print "                  setFamilyRewards(updatedRewards);"
                print "                }"
                print "              }}"
                print "            >"
                print "              ลบ"
                print "            </Button>"
                print "          </div>"
                print "        </div>"
                print "      </Card>"
                print "    );"
                print "  };"
                print ""
                functions_added = 1
            }
            useState_section = 0
        }
        
        { print }
        ' "$file" > "$temp_file"
        
        mv "$temp_file" "$file"
        log_success "Added missing render functions"
    else
        log_info "renderChildCard function already exists"
    fi
}

# Function to add missing form state if needed
add_missing_form_states() {
    local file="$1"
    
    log_info "Checking for missing form states..."
    
    # Add missing states if they don't exist
    local missing_states=()
    
    if ! grep -q "rewardForm.*useState" "$file"; then
        missing_states+=("rewardForm")
    fi
    
    if ! grep -q "const \[form\].*Form.useForm" "$file" && ! grep -q "Form.useForm()" "$file"; then
        missing_states+=("form")
    fi
    
    if [[ ${#missing_states[@]} -gt 0 ]]; then
        log_info "Adding missing states: ${missing_states[*]}"
        
        # Find the last useState and add missing ones after it
        local temp_file="${file}.temp"
        awk -v states="${missing_states[*]}" '
        /const \[.*\] = useState.*{/ {
            print
            in_object = 1
            next
        }
        
        in_object && /^[[:space:]]*}/ {
            print
            in_object = 0
            
            # Add missing states here
            if (states ~ /rewardForm/ && !added_reward) {
                print ""
                print "  const [rewardForm, setRewardForm] = useState({"
                print "    Name: \"\","
                print "    Cost: \"\","
                print "    Color: \"#FF8CC8\","
                print "    Category: \"\","
                print "  });"
                added_reward = 1
            }
            
            if (states ~ /form/ && !added_form) {
                print "  const [form] = Form.useForm();"
                added_form = 1
            }
            next
        }
        
        { print }
        ' "$file" > "$temp_file"
        
        mv "$temp_file" "$file"
        log_success "Added missing form states"
    fi
}

# Function to fix autocomplete warnings
fix_autocomplete_warnings() {
    local file="$1"
    
    log_info "Fixing autocomplete warnings in $file"
    
    # Fix password inputs
    sed -i.tmp '
        s/type="password"/type="password" autoComplete="current-password"/g
        s/type="email"/type="email" autoComplete="email"/g  
        s/placeholder="ชื่อผู้ใช้"/placeholder="ชื่อผู้ใช้" autoComplete="username"/g
        s/placeholder="รหัสผ่าน"/placeholder="รหัสผ่าน" autoComplete="current-password"/g
    ' "$file"
    
    # Clean up
    [[ -f "${file}.tmp" ]] && rm "${file}.tmp"
    
    log_success "Fixed autocomplete attributes"
}

# Function to fix all files with autocomplete issues
fix_all_autocomplete_issues() {
    log_info "Fixing autocomplete issues in all relevant files..."
    
    local files_to_fix=(
        "src/components/LoginPage.jsx"
        "src/pages/LoginPage.jsx"
        "src/components/FamilyLogin.jsx"
        "src/pages/FamilyLogin.jsx"
    )
    
    for file in "${files_to_fix[@]}"; do
        if [[ -f "$file" ]]; then
            log_info "Processing $file..."
            fix_autocomplete_warnings "$file"
        fi
    done
}

# Main fix function
main() {
    log_info "🔧 Fixing missing functions and autocomplete warnings..."
    
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
    
    # Apply fixes
    add_missing_render_functions "$admin_dashboard"
    add_missing_form_states "$admin_dashboard"
    fix_all_autocomplete_issues
    
    # Clear cache
    log_info "Clearing cache..."
    [[ -d "node_modules/.cache" ]] && rm -rf node_modules/.cache
    [[ -d ".vite" ]] && rm -rf .vite
    
    log_success "🎉 Missing Functions Fix Complete!"
    echo ""
    log_info "What was fixed:"
    echo "  ✅ Added renderChildCard function"
    echo "  ✅ Added renderBehaviorCard function"
    echo "  ✅ Added renderRewardCard function"
    echo "  ✅ Added missing form states"
    echo "  ✅ Fixed autocomplete warnings"
    echo "  ✅ Created backup file"
    echo "  ✅ Cleared cache"
    echo ""
    log_info "Next steps:"
    echo "  1. Restart your development server: npm run dev"
    echo "  2. Test the AdminDashboard functionality"
    echo "  3. Check browser console for remaining errors"
    echo ""
    log_success "Happy coding! 🎯"
}

# Run the fix
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi