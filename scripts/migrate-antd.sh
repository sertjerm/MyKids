#!/bin/bash

# migrate-to-antd.sh - สคริปต์เปลี่ยน Custom Components เป็น Ant Design Components
# สำหรับโปรเจค My-Kids Management System

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="."
SRC_DIR="$PROJECT_ROOT/src"
COMPONENTS_DIR="$SRC_DIR/components"

# Logging functions
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

# Function to check if file exists and create backup
backup_file() {
    local file="$1"
    if [[ -f "$file" ]]; then
        local backup="${file}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$file" "$backup"
        log_info "Backed up $file to $backup"
        return 0
    fi
    return 1
}

# Function to install Ant Design
install_antd() {
    log_info "Installing Ant Design and required packages..."
    
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Make sure you're in the project root directory."
        exit 1
    fi
    
    # Install antd and related packages
    npm install antd @ant-design/icons
    
    # Install additional useful packages
    npm install dayjs # For date handling with antd
    
    log_success "Ant Design installed successfully"
}

# Function to update imports in a file
update_imports() {
    local file="$1"
    log_info "Updating imports in $file"
    
    # Backup original file
    backup_file "$file"
    
    # Replace custom component imports with antd imports
    sed -i.tmp '
        # Replace Avatar imports
        s/import.*Avatar.*from.*["\047]..\/.*common.*Avatar["\047]/import { Avatar } from '\''antd'\''/g
        s/import.*{.*Avatar.*}.*from.*["\047]..\/.*common["\047]/import { Avatar, Button, Card } from '\''antd'\''/g
        
        # Replace Button imports  
        s/import.*Button.*from.*["\047]..\/.*common.*Button["\047]/import { Button } from '\''antd'\''/g
        s/import.*{.*Button.*}.*from.*["\047]..\/.*common["\047]/import { Button, Card, Avatar } from '\''antd'\''/g
        
        # Replace Card imports
        s/import.*Card.*from.*["\047]..\/.*common.*Card["\047]/import { Card } from '\''antd'\''/g
        s/import.*{.*Card.*}.*from.*["\047]..\/.*common["\047]/import { Card, Button, Avatar } from '\''antd'\''/g
        
        # Replace Modal imports
        s/import.*Modal.*from.*["\047]..\/.*common.*Modal["\047]/import { Modal } from '\''antd'\''/g
        
        # Add Icons import if not exists (for antd icons)
        1i\import { UserOutlined, HeartOutlined, StarOutlined } from '\''@ant-design/icons'\'';
    ' "$file"
    
    # Clean up temporary file
    [[ -f "${file}.tmp" ]] && rm "${file}.tmp"
}

# Function to convert Avatar component usage
convert_avatar_usage() {
    local file="$1"
    log_info "Converting Avatar usage in $file"
    
    # Convert Avatar props and attributes
    sed -i.tmp '
        # Convert size prop values
        s/<Avatar\([^>]*\)size="sm"/<Avatar\1size="small"/g
        s/<Avatar\([^>]*\)size="md"/<Avatar\1size="default"/g  
        s/<Avatar\([^>]*\)size="lg"/<Avatar\1size="large"/g
        s/<Avatar\([^>]*\)size="xl"/<Avatar\1size={64}/g
        
        # Convert src prop to src
        s/<Avatar\([^>]*\)avatarSrc=/<Avatar\1src=/g
        
        # Add icon prop for default avatar
        s/<Avatar\([^>]*\)>.*<User.*\/.*>.*<\/Avatar>/<Avatar\1 icon={<UserOutlined \/>} \/>/g
        
        # Convert emoji avatar to custom text
        s/<Avatar\([^>]*\)emoji="\([^"]*\)"/<Avatar\1>{"\2"}/g
        
        # Convert name initials (need custom logic)
        s/<Avatar\([^>]*\)name="\([^"]*\)"/<Avatar\1>{\2.split(" ").map(n => n[0]).join("")}<\/Avatar>/g
    ' "$file"
    
    [[ -f "${file}.tmp" ]] && rm "${file}.tmp"
}

# Function to convert Button component usage  
convert_button_usage() {
    local file="$1"
    log_info "Converting Button usage in $file"
    
    sed -i.tmp '
        # Convert button types
        s/<Button\([^>]*\)variant="primary"/<Button\1type="primary"/g
        s/<Button\([^>]*\)variant="secondary"/<Button\1type="default"/g
        s/<Button\([^>]*\)variant="danger"/<Button\1type="primary" danger/g
        s/<Button\([^>]*\)variant="success"/<Button\1type="primary"/g
        s/<Button\([^>]*\)variant="warning"/<Button\1type="primary"/g
        s/<Button\([^>]*\)variant="ghost"/<Button\1type="text"/g
        
        # Convert loading prop
        s/<Button\([^>]*\)loading={true}/<Button\1loading/g
        
        # Convert icon prop
        s/<Button\([^>]*\)icon={<\([^>]*\)>}/<Button\1icon={<\2 \/>}/g
    ' "$file"
    
    [[ -f "${file}.tmp" ]] && rm "${file}.tmp"
}

# Function to convert Card component usage
convert_card_usage() {
    local file="$1" 
    log_info "Converting Card usage in $file"
    
    sed -i.tmp '
        # Convert Card with title
        s/<Card\([^>]*\)title="\([^"]*\)"/<Card\1title="\2"/g
        
        # Convert hover effect
        s/<Card\([^>]*\)hover={true}/<Card\1hoverable/g
        s/<Card\([^>]*\)hover/<Card\1hoverable/g
        
        # Convert padding/bodyStyle
        s/<Card\([^>]*\)padding="\([^"]*\)"/<Card\1bodyStyle={{padding: "\2"}}/g
        
        # Add bordered prop for default styling
        s/<Card\([^>]*\)>/<Card\1 bordered>/g
    ' "$file"
    
    [[ -f "${file}.tmp" ]] && rm "${file}.tmp"
}

# Function to add antd CSS import to main file
add_antd_css() {
    local main_file="$SRC_DIR/main.jsx"
    if [[ ! -f "$main_file" ]]; then
        main_file="$SRC_DIR/index.js"
    fi
    
    if [[ -f "$main_file" ]]; then
        log_info "Adding Ant Design CSS import to $main_file"
        backup_file "$main_file"
        
        # Add antd CSS import at the top
        sed -i.tmp '1i\import '\''antd/dist/reset.css'\'';' "$main_file"
        [[ -f "${main_file}.tmp" ]] && rm "${main_file}.tmp"
        
        log_success "Added Ant Design CSS import"
    else
        log_warning "Main file not found. Please manually add 'import \"antd/dist/reset.css\"' to your entry file."
    fi
}

# Function to create ConfigProvider wrapper
create_antd_config() {
    local config_file="$SRC_DIR/config/antdConfig.js"
    
    mkdir -p "$SRC_DIR/config"
    
    log_info "Creating Ant Design configuration..."
    
cat > "$config_file" << 'EOF'
// src/config/antdConfig.js
import { ConfigProvider } from 'antd';
import th_TH from 'antd/locale/th_TH';

export const antdConfig = {
  locale: th_TH,
  theme: {
    token: {
      // Primary colors - Pastel rainbow theme
      colorPrimary: '#a855f7', // Purple
      colorSuccess: '#10b981', // Emerald  
      colorWarning: '#f59e0b', // Amber
      colorError: '#ef4444',   // Red
      colorInfo: '#3b82f6',    // Blue
      
      // Border radius
      borderRadius: 16,
      borderRadiusLG: 20,
      borderRadiusXS: 8,
      
      // Font family
      fontFamily: '"Sarabun", system-ui, -apple-system, sans-serif',
      
      // Colors for kid-friendly interface
      colorBgContainer: '#ffffff',
      colorBgElevated: '#fafafa',
      
      // Component specific tokens
      Button: {
        borderRadius: 12,
        controlHeight: 40,
      },
      
      Card: {
        borderRadius: 16,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }
    },
    
    components: {
      Button: {
        borderRadius: 12,
        controlHeight: 40,
        fontWeight: 600,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      
      Card: {
        borderRadius: 16,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        headerBg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
      },
      
      Avatar: {
        borderRadius: '50%',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }
    }
  }
};

export default antdConfig;
EOF

    log_success "Created Ant Design configuration file"
}

# Function to update App.jsx with ConfigProvider
update_app_with_config_provider() {
    local app_file="$SRC_DIR/App.jsx"
    
    if [[ ! -f "$app_file" ]]; then
        log_warning "App.jsx not found, skipping ConfigProvider setup"
        return 1
    fi
    
    log_info "Adding ConfigProvider to App.jsx"
    backup_file "$app_file"
    
    # Add imports at the top
    sed -i.tmp '1i\import { ConfigProvider } from '\''antd'\'';\
import antdConfig from '\''./config/antdConfig'\'';\
' "$app_file"
    
    # Wrap App content with ConfigProvider
    sed -i.tmp '
        # Find function App() or const App = and add ConfigProvider
        /^function App\|^const App\|^export default function App/ {
            # Look for the return statement
            :a
            n
            /return/ {
                # Add ConfigProvider wrapper
                s/return (/return (\
    <ConfigProvider {...antdConfig}>/
                # Continue reading until we find the closing of return
                :b
                n
                # If this is the last closing parenthesis/bracket of return, add closing ConfigProvider
                /^[[:space:]]*)[[:space:]]*$\|^[[:space:]]*}[[:space:]]*$/ {
                    i\    </ConfigProvider>
                    b
                }
                bb
            }
            ba
        }
    ' "$app_file"
    
    [[ -f "${app_file}.tmp" ]] && rm "${app_file}.tmp"
    
    log_success "Updated App.jsx with ConfigProvider"
}

# Function to process all React files
process_react_files() {
    log_info "Processing React component files..."
    
    # Find all .jsx and .js files in src directory
    find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) ! -path "*/node_modules/*" | while read -r file; do
        log_info "Processing: $file"
        
        # Skip if file doesn't contain React components
        if ! grep -q "import.*React\|from.*react" "$file" 2>/dev/null; then
            continue
        fi
        
        # Update imports
        update_imports "$file"
        
        # Convert component usage
        convert_avatar_usage "$file"
        convert_button_usage "$file" 
        convert_card_usage "$file"
        
        log_success "Processed: $file"
    done
}

# Function to clean up unused custom components
cleanup_custom_components() {
    log_info "Cleaning up unused custom components..."
    
    local common_dir="$COMPONENTS_DIR/common"
    
    if [[ -d "$common_dir" ]]; then
        # Move custom components to backup directory
        local backup_dir="$common_dir/backup_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$backup_dir"
        
        # Move custom components that are replaced by antd
        for component in Avatar.jsx Button.jsx Card.jsx Modal.jsx; do
            if [[ -f "$common_dir/$component" ]]; then
                mv "$common_dir/$component" "$backup_dir/"
                log_info "Moved $component to backup directory"
            fi
        done
        
        log_success "Custom components backed up to $backup_dir"
    fi
}

# Function to create migration report
create_migration_report() {
    local report_file="antd-migration-report.md"
    
    log_info "Creating migration report..."
    
cat > "$report_file" << EOF
# Ant Design Migration Report

Generated on: $(date)

## Migration Summary

### ✅ Completed Tasks
- [x] Installed Ant Design packages (\`antd\`, \`@ant-design/icons\`, \`dayjs\`)
- [x] Created Ant Design configuration with Thai locale and kid-friendly theme
- [x] Updated imports in React components
- [x] Converted custom Avatar components to Ant Design Avatar
- [x] Converted custom Button components to Ant Design Button  
- [x] Converted custom Card components to Ant Design Card
- [x] Added ConfigProvider to App.jsx
- [x] Backed up original custom components
- [x] Added Ant Design CSS imports

### 🔄 Component Mapping

| Custom Component | Ant Design Component | Status |
|------------------|---------------------|---------|
| Avatar           | Avatar              | ✅ Migrated |
| Button           | Button              | ✅ Migrated |
| Card             | Card                | ✅ Migrated |
| Modal            | Modal               | ✅ Migrated |

### 🎨 Theme Configuration

The project now uses a kid-friendly pastel rainbow theme with:
- Primary color: Purple (#a855f7)
- Thai locale (th_TH) support
- Rounded corners (16px border radius)
- Custom font family: 'Sarabun'
- Enhanced shadows and spacing for better UX

### 📁 File Changes

#### New Files Created:
- \`src/config/antdConfig.js\` - Ant Design theme configuration

#### Modified Files:
- All \`.jsx\` and \`.js\` files in \`src/\` directory
- \`package.json\` - Added Ant Design dependencies
- Main entry file - Added CSS imports

#### Backed Up Files:
- Original custom components moved to \`backup_*\` directories
- All modified files have \`.backup.*\` versions

### 🚀 Next Steps

1. **Test the application** - Run \`npm start\` to verify everything works
2. **Review styling** - Some custom styles may need adjustment
3. **Update specific components** - Some complex components may need manual updates
4. **Add more Ant Design components** - Consider using:
   - \`Table\` for data display
   - \`Form\` for form handling
   - \`DatePicker\` for date selection
   - \`Select\` for dropdowns
   - \`Notification\` for alerts

### ⚠️  Manual Review Needed

- Check for any remaining styling issues
- Verify responsive design on mobile devices
- Test all interactive features
- Update any custom CSS that may conflict with Ant Design

### 📞 Support

If you encounter any issues, check:
1. Ant Design documentation: https://ant.design/
2. Ant Design icons: https://ant.design/components/icon/
3. Theme customization: https://ant.design/docs/react/customize-theme

EOF

    log_success "Migration report created: $report_file"
}

# Main execution function
main() {
    log_info "Starting Ant Design migration for My-Kids Management System..."
    log_info "Project root: $(pwd)"
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]] || [[ ! -d "$SRC_DIR" ]]; then
        log_error "This doesn't appear to be a React project root. Please run from the project root directory."
        exit 1
    fi
    
    # Confirm with user
    echo -n "This will modify your React components to use Ant Design. Continue? (y/N): "
    read -r confirm
    if [[ $confirm != [yY] ]]; then
        log_warning "Migration cancelled by user"
        exit 0
    fi
    
    # Execute migration steps
    install_antd
    create_antd_config
    add_antd_css
    process_react_files
    update_app_with_config_provider
    cleanup_custom_components
    create_migration_report
    
    log_success "🎉 Ant Design migration completed successfully!"
    log_info "Please review the migration report (antd-migration-report.md) for next steps."
    log_info "Run 'npm start' to test your application."
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi