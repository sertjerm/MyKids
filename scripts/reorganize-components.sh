#!/bin/bash
# scripts/reorganize-components.sh
# Script สำหรับจัดระเบียบ components ใน MyKids Tracker project

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Project directories
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$PROJECT_ROOT/src"
COMPONENTS_DIR="$SRC_DIR/components"
PAGES_DIR="$SRC_DIR/pages"

echo -e "${PURPLE}🚀 MyKids Tracker - Component Reorganization${NC}"
echo -e "${BLUE}=================================================${NC}"

# Function to print colored output
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to create backup
create_backup() {
    log "Creating backup..."
    BACKUP_DIR="$PROJECT_ROOT/backup-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    if [ -d "$COMPONENTS_DIR" ]; then
        cp -r "$COMPONENTS_DIR" "$BACKUP_DIR/"
        success "Backup created at: $BACKUP_DIR"
    fi
    
    if [ -f "$SRC_DIR/App.jsx" ]; then
        cp "$SRC_DIR/App.jsx" "$BACKUP_DIR/"
    fi
}

# Function to create component file
create_component_file() {
    local filepath="$1"
    local content="$2"
    
    # Create directory if it doesn't exist
    mkdir -p "$(dirname "$filepath")"
    
    # Write content to file
    cat > "$filepath" << 'EOF'
$content
EOF
    
    # Replace $content placeholder with actual content
    printf '%s' "$content" > "$filepath"
    
    success "Created: $(basename "$filepath")"
}

# Step 2: Create Common Components
create_common_components() {
    log "Creating common components..."
    
    local common_dir="$COMPONENTS_DIR/common"
    mkdir -p "$common_dir"
    
    # Avatar.jsx
    create_component_file "$common_dir/Avatar.jsx" "// src/components/common/Avatar.jsx
import React from 'react';
import { User } from 'lucide-react';

/**
 * Avatar Component - รองรับทั้งรูปภาพและ emoji
 * @param {string} src - URL ของรูปภาพ
 * @param {string} emoji - emoji สำหรับใช้แทนรูป
 * @param {string} name - ชื่อสำหรับสร้าง initials
 * @param {string} size - ขนาด (sm, md, lg, xl)
 * @param {string} className - CSS classes เพิ่มเติม
 */
const Avatar = ({ 
  src, 
  emoji, 
  name = '', 
  size = 'md', 
  className = '',
  fallbackBg = 'bg-gradient-to-br from-pink-200 to-purple-200'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm', 
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
    '2xl': 'w-32 h-32 text-2xl'
  };

  const generateInitials = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.split(' ');
    return names.length > 1 
      ? \`\${names[0][0]}\${names[names.length-1][0]}\`.toUpperCase()
      : fullName.substring(0, 2).toUpperCase();
  };

  const avatarSrc = src && src.startsWith('http') ? src : null;

  return (
    <div className={\`\${sizeClasses[size]} rounded-full \${fallbackBg} flex items-center justify-center overflow-hidden relative \${className}\`}>
      {/* Emoji */}
      {emoji && (
        <span className=\"text-2xl leading-none\">{emoji}</span>
      )}
      
      {/* Image */}
      {!emoji && avatarSrc && (
        <img
          src={avatarSrc}
          alt={name}
          className=\"w-full h-full object-cover\"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      )}
      
      {/* Initials fallback */}
      {!emoji && (
        <div
          className={\`w-full h-full \${fallbackBg} flex items-center justify-center text-white font-bold font-thai \${!avatarSrc ? 'flex' : 'hidden'}\`}
        >
          {avatarSrc ? null : generateInitials(name)}
        </div>
      )}
      
      {/* Default icon fallback */}
      {!emoji && !avatarSrc && !name && (
        <User className=\"w-1/2 h-1/2 text-gray-400\" />
      )}
    </div>
  );
};

export default Avatar;"
    
    # Button.jsx
    create_component_file "$common_dir/Button.jsx" "// src/components/common/Button.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button Component - ปุ่มพื้นฐานที่ใช้ทั่วโปรเจค
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-thai';
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white focus:ring-purple-500',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-blue-500',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white focus:ring-green-500',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white focus:ring-red-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white focus:ring-yellow-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={\`\${baseClasses} \${variants[variant]} \${sizes[size]} \${className}\`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <Loader2 className=\"w-4 h-4 animate-spin\" />
      ) : Icon ? (
        <Icon className=\"w-4 h-4\" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;"

    # Card.jsx
    create_component_file "$common_dir/Card.jsx" "// src/components/common/Card.jsx
import React from 'react';

/**
 * Card Component - การ์ดพื้นฐานที่ใช้ทั่วโปรเจค
 */
const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  hover = false,
  gradient = false,
  shadow = 'shadow-lg'
}) => {
  const baseClasses = 'bg-white rounded-2xl';
  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer' : '';
  const gradientClasses = gradient ? 'bg-gradient-to-br from-white via-purple-50 to-pink-50' : '';

  return (
    <div className={\`\${baseClasses} \${hoverClasses} \${gradientClasses} \${shadow} \${padding} \${className}\`}>
      {children}
    </div>
  );
};

export default Card;"

    # LoadingSpinner.jsx
    create_component_file "$common_dir/LoadingSpinner.jsx" "// src/components/common/LoadingSpinner.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingSpinner Component - แสดง loading state
 */
const LoadingSpinner = ({ 
  size = 'md', 
  text = 'กำลังโหลด...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={\`flex flex-col items-center justify-center p-8 \${className}\`}>
      <Loader2 className={\`\${sizeClasses[size]} animate-spin text-purple-500 mb-2\`} />
      {text && (
        <p className=\"text-gray-600 text-sm font-thai\">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;"

    # Modal.jsx
    create_component_file "$common_dir/Modal.jsx" "// src/components/common/Modal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal Component - popup modal สำหรับแสดงเนื้อหา
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]'
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className=\"fixed inset-0 z-50 flex items-center justify-center p-4\">
      <div 
        className=\"absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm\"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      
      <div className={\`relative bg-white rounded-2xl shadow-2xl w-full \${sizes[size]} max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300\`}>
        {(title || showCloseButton) && (
          <div className=\"flex items-center justify-between p-6 border-b border-gray-200\">
            {title && (
              <h3 className=\"text-xl font-bold text-gray-800 font-thai\">{title}</h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className=\"p-2 hover:bg-gray-100 rounded-full transition-colors\"
              >
                <X className=\"w-5 h-5 text-gray-500\" />
              </button>
            )}
          </div>
        )}
        
        <div className=\"overflow-y-auto max-h-[calc(90vh-8rem)]\">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;"

    # ErrorBoundary.jsx
    create_component_file "$common_dir/ErrorBoundary.jsx" "// src/components/common/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary Component - จัดการข้อผิดพลาดใน React
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className=\"min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4\">
          <div className=\"bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center\">
            <AlertTriangle className=\"w-16 h-16 text-red-500 mx-auto mb-4\" />
            <h2 className=\"text-2xl font-bold text-gray-800 mb-2 font-thai\">เกิดข้อผิดพลาด</h2>
            <p className=\"text-gray-600 mb-6 font-thai\">ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด</p>
            <button
              onClick={() => window.location.reload()}
              className=\"bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 mx-auto font-thai\"
            >
              <RefreshCw className=\"w-4 h-4\" /> รีเฟรชหน้า
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className=\"mt-4 text-left text-sm text-gray-500\">
                <summary>รายละเอียดข้อผิดพลาด</summary>
                <pre className=\"mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto\">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;"

    # Common index.js
    create_component_file "$common_dir/index.js" "// src/components/common/index.js
export { default as Avatar } from './Avatar';
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as Modal } from './Modal';
export { default as ErrorBoundary } from './ErrorBoundary';"
    
    success "Created common components (6 files)"
}

# Step 3: Create Shared Components
create_shared_components() {
    log "Creating shared components..."
    
    local shared_dir="$COMPONENTS_DIR/shared"
    mkdir -p "$shared_dir"
    
    # BehaviorCard.jsx
    create_component_file "$shared_dir/BehaviorCard.jsx" "// src/components/shared/BehaviorCard.jsx
import React from 'react';
import { Heart, AlertTriangle } from 'lucide-react';

/**
 * BehaviorCard Component - แสดงข้อมูลพฤติกรรม (รองรับทั้ง admin และ child view)
 */
const BehaviorCard = ({ 
  behavior, 
  onSelect = () => {}, 
  selected = false, 
  disabled = false, 
  showPoints = true,
  showCategory = true,
  mode = 'child',
  className = '',
  children
}) => {
  if (!behavior) return null;

  const isGood = behavior.Type === 'Good';
  const points = behavior.Points || 0;

  const modeStyles = {
    admin: 'p-4 border border-gray-200 hover:border-gray-300',
    child: 'p-5 border-2 hover:scale-105 transform',
    compact: 'p-3 border border-gray-200'
  };

  const typeStyles = {
    Good: {
      border: selected ? 'border-green-400' : 'border-green-200',
      bg: selected ? 'bg-green-50' : 'bg-gradient-to-br from-green-50 to-emerald-50',
      shadow: selected ? 'shadow-xl ring-4 ring-green-100' : 'shadow-md',
      icon: Heart
    },
    Bad: {
      border: selected ? 'border-red-400' : 'border-red-200',
      bg: selected ? 'bg-red-50' : 'bg-gradient-to-br from-red-50 to-pink-50',
      shadow: selected ? 'shadow-xl ring-4 ring-red-100' : 'shadow-md',
      icon: AlertTriangle
    }
  };

  const currentStyle = typeStyles[behavior.Type] || typeStyles.Good;
  const IconComponent = currentStyle.icon;

  return (
    <div 
      className={\`
        \${modeStyles[mode]} 
        \${currentStyle.border} 
        \${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : \`\${currentStyle.bg} cursor-pointer hover:\${currentStyle.shadow}\`}
        \${selected ? currentStyle.shadow : ''}
        rounded-2xl transition-all duration-300
        \${className}
      \`}
      onClick={disabled ? undefined : () => onSelect(behavior)}
    >
      <div className=\"flex items-start gap-3\">
        <div className=\"flex-shrink-0 flex flex-col items-center gap-2\">
          <IconComponent 
            className={\`w-5 h-5 \${isGood ? 'text-green-600' : 'text-red-600'}\`} 
          />
          {behavior.Color && (
            <div 
              className=\"w-4 h-4 rounded-full shadow-sm ring-2 ring-white\"
              style={{ backgroundColor: behavior.Color }}
            />
          )}
        </div>

        <div className=\"flex-1 min-w-0\">
          <h3 className={\`font-bold text-gray-800 mb-1 \${mode === 'child' ? 'text-lg' : 'text-base'}\`}>
            {behavior.Name}
          </h3>
          
          {showCategory && behavior.Category && (
            <p className={\`text-gray-600 font-medium mb-1 \${mode === 'compact' ? 'text-xs' : 'text-sm'}\`}>
              {behavior.Category}
            </p>
          )}
          
          {behavior.Description && (
            <p className={\`text-gray-500 leading-relaxed \${mode === 'compact' ? 'text-xs' : 'text-sm'}\`}>
              {behavior.Description}
            </p>
          )}

          {behavior.IsRepeatable && mode !== 'compact' && (
            <div className=\"mt-2\">
              <span className=\"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800\">
                ทำซ้ำได้
              </span>
            </div>
          )}
        </div>

        {showPoints && (
          <div className=\"flex-shrink-0\">
            <div className={\`px-3 py-2 rounded-xl text-sm font-bold shadow-md \${
              isGood 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                : 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
            }\`}>
              {isGood ? '+' : '-'}{Math.abs(points)}
            </div>
          </div>
        )}
      </div>

      {children && (
        <div className=\"mt-3 pt-3 border-t border-gray-100\">
          {children}
        </div>
      )}
    </div>
  );
};

export default BehaviorCard;"

    # RewardCard.jsx
    create_component_file "$shared_dir/RewardCard.jsx" "// src/components/shared/RewardCard.jsx
import React from 'react';
import { Gift, Star, Lock } from 'lucide-react';

/**
 * RewardCard Component - แสดงข้อมูลรางวัล
 */
const RewardCard = ({ 
  reward, 
  onSelect = () => {}, 
  selected = false,
  canRedeem = true,
  currentPoints = 0,
  mode = 'child',
  className = '',
  children
}) => {
  if (!reward) return null;

  const cost = reward.Cost || 0;
  const isAffordable = currentPoints >= cost;
  const finalCanRedeem = canRedeem && isAffordable;

  const modeStyles = {
    admin: 'p-4 border border-gray-200',
    child: 'p-5 border-2',
    compact: 'p-3 border border-gray-200'
  };

  return (
    <div 
      className={\`
        \${modeStyles[mode]}
        \${selected ? 'border-purple-400 bg-purple-50 shadow-xl ring-4 ring-purple-100' : 'border-gray-200 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50'}
        \${!finalCanRedeem && mode === 'child' ? 'opacity-60' : 'hover:shadow-lg'}
        \${mode === 'child' ? 'hover:scale-105 transform' : ''}
        rounded-2xl transition-all duration-300 cursor-pointer
        \${className}
      \`}
      onClick={() => onSelect(reward)}
    >
      <div className=\"flex items-start gap-4\">
        <div className=\"flex-shrink-0\">
          <div className={\`w-12 h-12 rounded-xl flex items-center justify-center \${
            finalCanRedeem 
              ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' 
              : 'bg-gray-200 text-gray-400'
          }\`}>
            {!finalCanRedeem && mode === 'child' ? (
              <Lock className=\"w-6 h-6\" />
            ) : (
              <Gift className=\"w-6 h-6\" />
            )}
          </div>
        </div>

        <div className=\"flex-1 min-w-0\">
          <h3 className={\`font-bold text-gray-800 mb-1 \${mode === 'child' ? 'text-lg' : 'text-base'}\`}>
            {reward.Name}
          </h3>
          
          {reward.Description && (
            <p className={\`text-gray-600 leading-relaxed \${mode === 'compact' ? 'text-xs' : 'text-sm'}\`}>
              {reward.Description}
            </p>
          )}

          {!finalCanRedeem && mode === 'child' && (
            <p className=\"text-red-600 text-xs font-medium mt-2\">
              ต้องการอีก {cost - currentPoints} คะแนน
            </p>
          )}
        </div>

        <div className=\"flex-shrink-0 text-right\">
          <div className={\`px-3 py-2 rounded-xl text-sm font-bold shadow-md flex items-center gap-1 \${
            finalCanRedeem 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
              : 'bg-gray-200 text-gray-600'
          }\`}>
            <Star className=\"w-4 h-4\" />
            {cost}
          </div>
          
          {mode === 'child' && isAffordable && (
            <p className=\"text-xs text-green-600 font-medium mt-1\">
              แลกได้!
            </p>
          )}
        </div>
      </div>

      {children && (
        <div className=\"mt-3 pt-3 border-t border-gray-100\">
          {children}
        </div>
      )}
    </div>
  );
};

export default RewardCard;"

    # PointsBadge.jsx
    create_component_file "$shared_dir/PointsBadge.jsx" "// src/components/shared/PointsBadge.jsx
import React from 'react';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * PointsBadge Component - แสดงคะแนนในรูปแบบ badge
 */
const PointsBadge = ({ 
  points = 0, 
  size = 'md', 
  showTrend = false,
  previousPoints = 0,
  variant = 'gradient',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm', 
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-lg'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const pointDiff = points - previousPoints;
  const isIncreasing = pointDiff > 0;

  const getColorClass = (pointValue) => {
    if (variant === 'simple') {
      return points >= 0 
        ? 'bg-green-100 text-green-800 border border-green-200'
        : 'bg-red-100 text-red-800 border border-red-200';
    }

    if (pointValue >= 100) {
      return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
    } else if (pointValue >= 50) {
      return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    } else if (pointValue >= 20) {
      return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
    } else if (pointValue >= 0) {
      return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
    } else {
      return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
    }
  };

  return (
    <div className=\"flex items-center gap-2\">
      <div className={\`
        inline-flex items-center gap-1.5 rounded-full font-bold shadow-md transition-all duration-200 hover:shadow-lg
        \${sizeClasses[size]} 
        \${getColorClass(points)} 
        \${className}
      \`}>
        <Star className={iconSizes[size]} />
        <span>{Math.abs(points).toLocaleString()}</span>
      </div>

      {showTrend && pointDiff !== 0 && (
        <div className={\`
          inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
          \${isIncreasing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
        \`}>
          {isIncreasing ? (
            <TrendingUp className=\"w-3 h-3\" />
          ) : (
            <TrendingDown className=\"w-3 h-3\" />
          )}
          {Math.abs(pointDiff)}
        </div>
      )}
    </div>
  );
};

export default PointsBadge;"

    # BehaviorList.jsx
    create_component_file "$shared_dir/BehaviorList.jsx" "// src/components/shared/BehaviorList.jsx
import React, { useState } from 'react';
import { Plus, Minus, Save } from 'lucide-react';
import BehaviorCard from './BehaviorCard';

/**
 * BehaviorList Component - แสดงรายการพฤติกรรมพร้อมระบบนับ
 */
const BehaviorList = ({
  behaviors = [],
  counts = {},
  onCountChange = () => {},
  onSave = () => {},
  saving = false,
  mode = 'child',
  showSaveButton = true,
  title = 'พฤติกรรม'
}) => {
  const [localCounts, setLocalCounts] = useState(counts);

  const handleCountChange = (behaviorId, change) => {
    const currentCount = localCounts[behaviorId] || 0;
    const newCount = Math.max(0, currentCount + change);
    
    const newCounts = {
      ...localCounts,
      [behaviorId]: newCount
    };
    
    setLocalCounts(newCounts);
    onCountChange(behaviorId, change, newCounts);
  };

  const totalActivities = Object.values(localCounts).reduce((sum, count) => sum + count, 0);

  if (!behaviors.length) {
    return (
      <div className=\"text-center py-8 text-gray-500\">
        <p>ไม่มี{title}ในขณะนี้</p>
      </div>
    );
  }

  return (
    <div className=\"space-y-4\">
      <div className=\"flex items-center justify-between\">
        <h2 className=\"text-lg font-semibold text-gray-800\">
          {title} ({behaviors.length} รายการ)
        </h2>
        {totalActivities > 0 && (
          <div className=\"text-sm text-gray-600\">
            รวม {totalActivities} กิจกรรม
          </div>
        )}
      </div>

      <div className=\"grid gap-4 sm:grid-cols-2\">
        {behaviors.map((behavior) => (
          <BehaviorCard 
            key={behavior.Id || behavior.id}
            behavior={behavior}
            mode={mode}
            showCategory={mode === 'admin'}
          >
            <div className=\"flex items-center justify-between\">
              <span className=\"text-sm text-gray-600\">จำนวนครั้ง:</span>
              <div className=\"flex items-center gap-2\">
                <button
                  onClick={() => handleCountChange(behavior.Id || behavior.id, -1)}
                  disabled={!localCounts[behavior.Id || behavior.id]}
                  className=\"w-8 h-8 p-0 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center\"
                >
                  <Minus className=\"w-4 h-4\" />
                </button>
                <span className=\"w-8 text-center font-bold\">
                  {localCounts[behavior.Id || behavior.id] || 0}
                </span>
                <button
                  onClick={() => handleCountChange(behavior.Id || behavior.id, 1)}
                  className=\"w-8 h-8 p-0 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center\"
                >
                  <Plus className=\"w-4 h-4\" />
                </button>
              </div>
            </div>
          </BehaviorCard>
        ))}
      </div>

      {showSaveButton && totalActivities > 0 && (
        <div className=\"fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50\">
          <button
            onClick={() => onSave(localCounts)}
            disabled={saving}
            className=\"bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-medium disabled:opacity-50\"
          >
            <Save className=\"w-5 h-5\" />
            {saving ? 'กำลังบันทึก...' : \`บันทึกกิจกรรม (\${totalActivities})\`}
          </button>
        </div>
      )}
    </div>
  );
};

export default BehaviorList;"

    # Shared index.js
    create_component_file "$shared_dir/index.js" "// src/components/shared/index.js
export { default as BehaviorCard } from './BehaviorCard';
export { default as RewardCard } from './RewardCard';
export { default as PointsBadge } from './PointsBadge';
export { default as BehaviorList } from './BehaviorList';"
    
    success "Created shared components (4 files)"
}

# Step 4: Create Layout Components
create_layout_components() {
    log "Creating layout components..."
    
    local layout_dir="$COMPONENTS_DIR/layout"
    mkdir -p "$layout_dir"
    
    # Header.jsx
    create_component_file "$layout_dir/Header.jsx" "// src/components/layout/Header.jsx
import React from 'react';
import { LogOut, Settings } from 'lucide-react';

/**
 * Header Component - หัวเรื่องหลักของแอป
 */
const Header = ({
  family,
  child = null,
  currentPoints = 0,
  onLogout,
  onSettings,
  showPoints = false,
  title = 'MyKids Tracker'
}) => {
  return (
    <header className=\"bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-40\">
      <div className=\"max-w-6xl mx-auto px-4 sm:px-6\">
        <div className=\"flex items-center justify-between h-16\">
          <div className=\"flex items-center gap-4\">
            <h1 className=\"text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent\">
              {title}
            </h1>
            
            {child && (
              <div className=\"flex items-center gap-2 ml-4\">
                <div className=\"w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center\">
                  <span className=\"text-lg\">{child.AvatarPath || child.avatarPath || '👶'}</span>
                </div>
                <span className=\"font-semibold text-gray-700 text-sm sm:text-base\">
                  {child.Name || child.name}
                </span>
              </div>
            )}
          </div>

          {showPoints && (
            <div className=\"hidden sm:block\">
              <div className=\"inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold shadow-md bg-gradient-to-r from-purple-500 to-purple-600 text-white\">
                <span>⭐</span>
                <span>{currentPoints}</span>
              </div>
            </div>
          )}

          <div className=\"flex items-center gap-2\">
            {family && !child && (
              <div className=\"flex items-center gap-2 mr-4\">
                <div className=\"w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center\">
                  <span className=\"text-lg\">{family.AvatarPath || '👨‍👩‍👧‍👦'}</span>
                </div>
                <span className=\"hidden sm:inline font-medium text-gray-700\">
                  {family.Name}
                </span>
              </div>
            )}

            {showPoints && (
              <div className=\"sm:hidden\">
                <div className=\"inline-flex items-center gap-1 px-2 py-1 rounded-full font-bold text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white\">
                  <span>⭐</span>
                  <span>{currentPoints}</span>
                </div>
              </div>
            )}

            <button
              onClick={onLogout}
              className=\"inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-transparent hover:bg-gray-100 rounded-xl transition-colors\"
            >
              <LogOut className=\"w-4 h-4\" />
              <span className=\"hidden sm:inline\">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;"

    # Navigation.jsx
    create_component_file "$layout_dir/Navigation.jsx" "// src/components/layout/Navigation.jsx
import React from 'react';

/**
 * Navigation Component - แท็บนำทางหลัก
 */
const Navigation = ({
  activeTab,
  onTabChange,
  tabs = [],
  variant = 'horizontal',
  className = ''
}) => {
  const baseTabClasses = 'flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer';
  const activeTabClasses = 'bg-white shadow-md border-b-2 border-current';
  const inactiveTabClasses = 'text-gray-600 hover:text-gray-800 hover:bg-white/50';

  const containerClasses = variant === 'horizontal' 
    ? 'flex overflow-x-auto scrollbar-hide gap-2'
    : 'flex flex-col gap-2';

  return (
    <nav className={\`\${containerClasses} \${className}\`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={\`
              \${baseTabClasses}
              \${isActive 
                ? \`\${tab.color} \${activeTabClasses}\` 
                : inactiveTabClasses
              }
              \${variant === 'horizontal' ? 'flex-shrink-0' : 'w-full'}
            \`}
          >
            <Icon className=\"w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0\" />
            <span className=\"text-xs sm:text-sm font-medium truncate\">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;"

    # Layout index.js
    create_component_file "$layout_dir/index.js" "// src/components/layout/index.js
export { default as Header } from './Header';
export { default as Navigation } from './Navigation';"
    
    success "Created layout components (2 files)"
}

# Step 5: Create Barrel Exports
create_barrel_exports() {
    log "Creating barrel exports..."
    
    # Main components index
    create_component_file "$COMPONENTS_DIR/index.js" "// src/components/index.js
// Central barrel export for all components

// Common UI Components
export * from './common';

// Shared Components  
export * from './shared';

// Layout Components
export * from './layout';

// Legacy exports (TODO: remove after migration)
export { default as LoginPage } from './LoginPage';"

    # Pages index
    mkdir -p "$PAGES_DIR"
    create_component_file "$PAGES_DIR/index.js" "// src/pages/index.js
export { default as AdminDashboard } from './AdminDashboard';
export { default as ChildInterface } from './ChildInterface';"
    
    success "Created barrel exports"
}

# Step 6: Move Page Components  
move_page_components() {
    log "Moving page components..."
    
    local moved_count=0
    
    # Move AdminDashboard
    if [ -f "$COMPONENTS_DIR/AdminDashboard.jsx" ]; then
        # Update path comment and move
        sed '1s|.*|// src/pages/AdminDashboard.jsx|' "$COMPONENTS_DIR/AdminDashboard.jsx" > "$PAGES_DIR/AdminDashboard.jsx"
        rm "$COMPONENTS_DIR/AdminDashboard.jsx"
        success "Moved AdminDashboard.jsx → pages/"
        ((moved_count++))
    fi
    
    # Move ChildInterface
    if [ -f "$COMPONENTS_DIR/ChildInterface.jsx" ]; then
        sed '1s|.*|// src/pages/ChildInterface.jsx|' "$COMPONENTS_DIR/ChildInterface.jsx" > "$PAGES_DIR/ChildInterface.jsx" 
        rm "$COMPONENTS_DIR/ChildInterface.jsx"
        success "Moved ChildInterface.jsx → pages/"
        ((moved_count++))
    fi
    
    if [ $moved_count -eq 0 ]; then
        warning "No page components found to move"
    fi
}

# Step 7: Remove Duplicate Files
remove_duplicate_files() {
    log "Removing duplicate files..."
    
    local removed_files=()
    
    # Files to remove
    local files_to_remove=(
        "$COMPONENTS_DIR/Avatar.jsx"
        "$COMPONENTS_DIR/BehaviorCard.jsx" 
        "$COMPONENTS_DIR/RewardCard.jsx"
        "$COMPONENTS_DIR/PointsBadge.jsx"
    )
    
    for file in "${files_to_remove[@]}"; do
        if [ -f "$file" ]; then
            rm "$file"
            removed_files+=($(basename "$file"))
            success "Removed duplicate: $(basename "$file")"
        fi
    done
    
    if [ ${#removed_files[@]} -eq 0 ]; then
        warning "No duplicate files found to remove"
    else
        success "Removed ${#removed_files[@]} duplicate files"
    fi
}

# Step 8: Update App.jsx
update_app_jsx() {
    log "Updating App.jsx..."
    
    if [ ! -f "$SRC_DIR/App.jsx" ]; then
        error "App.jsx not found!"
        return 1
    fi
    
    # Create updated App.jsx
    create_component_file "$SRC_DIR/App.jsx" "// src/App.jsx
import React, { useState, useEffect } from 'react';

// Import API service
import api from './services/api';

// Import pages (ย้ายจาก components/ ไป pages/)
import { AdminDashboard, ChildInterface } from './pages';

// Import components (ใช้ barrel exports)
import { ErrorBoundary, LoadingSpinner } from './components/common';
import { Header } from './components/layout';

// Import LoginPage (จะย้ายไป pages/ ในอนาคต)
import LoginPage from './components/LoginPage'; // TODO: ย้ายไป pages/

/**
 * Main App Component - จุดเริ่มต้นของแอปพลิเคชัน
 * ใช้โครงสร้าง components ใหม่ที่แยกเป็นหมวดหมู่
 */
function App() {
  const [currentFamily, setCurrentFamily] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [selectedChild, setSelectedChild] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  const [appError, setAppError] = useState(null);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setAppLoading(true);
      
      // Check for saved session
      const savedFamily = localStorage.getItem('mykids_current_family');
      if (savedFamily) {
        try {
          const family = JSON.parse(savedFamily);
          setCurrentFamily(family);
          setCurrentView('admin');
        } catch (error) {
          localStorage.removeItem('mykids_current_family');
        }
      }
      
    } catch (error) {
      console.error('App initialization error:', error);
      setAppError(error.message);
    } finally {
      setAppLoading(false);
    }
  };

  const handleLogin = (family) => {
    console.log('App: Family login:', family);
    setCurrentFamily(family);
    setCurrentView('admin');
    
    // Save to localStorage for session persistence
    localStorage.setItem('mykids_current_family', JSON.stringify(family));
  };

  const handleLogout = () => {
    setCurrentFamily(null);
    setCurrentView('login');
    setSelectedChild(null);
    
    // Clear saved session
    localStorage.removeItem('mykids_current_family');
  };

  const handleSelectChild = (child) => {
    console.log('App: Child selected:', child);
    setSelectedChild(child);
    setCurrentView('child');
  };

  const handleBackToAdmin = () => {
    setCurrentView('admin');
    setSelectedChild(null);
  };

  // Loading screen
  if (appLoading) {
    return (
      <div className=\"min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center\">
        <LoadingSpinner size=\"xl\" text=\"กำลังเริ่มต้นแอปพลิเคชัน...\" />
      </div>
    );
  }

  // Error screen
  if (appError) {
    return (
      <div className=\"min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4\">
        <div className=\"bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center\">
          <h2 className=\"text-2xl font-bold text-gray-800 mb-4\">ไม่สามารถเริ่มต้นแอปได้</h2>
          <p className=\"text-gray-600 mb-6\">{appError}</p>
          <button
            onClick={() => window.location.reload()}
            className=\"bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors\"
          >
            รีโหลดแอป
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className=\"min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100\">
        {/* Login View */}
        {currentView === 'login' && (
          <LoginPage onLogin={handleLogin} />
        )}

        {/* Admin View */}
        {currentView === 'admin' && currentFamily && (
          <>
            <Header
              family={currentFamily}
              title=\"MyKids Admin\"
              onLogout={handleLogout}
              showPoints={false}
            />
            <AdminDashboard
              family={currentFamily}
              onLogout={handleLogout}
              onSelectChild={handleSelectChild}
            />
          </>
        )}

        {/* Child View */}
        {currentView === 'child' && currentFamily && selectedChild && (
          <>
            <Header
              family={currentFamily}
              child={selectedChild}
              title=\"MyKids\"
              onLogout={handleBackToAdmin}
              showPoints={true}
              currentPoints={selectedChild.currentPoints || 0}
            />
            <ChildInterface
              family={currentFamily}
              child={selectedChild}
              onBack={handleBackToAdmin}
            />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;"
    
    success "Updated App.jsx with new component structure"
}

# Step 9: Generate Report
generate_report() {
    log "Generating reorganization report..."
    
    echo -e "\n${BLUE}📊 Component Reorganization Report${NC}"
    echo -e "${BLUE}=================================${NC}"
    
    local count_files() {
        local dir="$1"
        if [ -d "$dir" ]; then
            find "$dir" -name "*.jsx" | wc -l
        else
            echo "0"
        fi
    }

    echo -e "${GREEN}📁 New Structure:${NC}"
    echo "   📁 components/common/    $(count_files "$COMPONENTS_DIR/common") files"
    echo "   📁 components/shared/    $(count_files "$COMPONENTS_DIR/shared") files" 
    echo "   📁 components/layout/    $(count_files "$COMPONENTS_DIR/layout") files"
    echo "   📁 pages/               $(count_files "$PAGES_DIR") files"
    
    echo -e "\n${GREEN}✅ Features:${NC}"
    echo "   ✅ Eliminated duplicate components"
    echo "   ✅ Created reusable common components"
    echo "   ✅ Added barrel exports for easy imports"
    echo "   ✅ Separated page-level components"
    echo "   ✅ Updated App.jsx with new structure"
    echo "   ✅ Added ErrorBoundary and LoadingSpinner"
    
    echo -e "\n${YELLOW}📋 Next Steps:${NC}"
    echo "   1. Test the application: npm start"
    echo "   2. Check console for any import errors"
    echo "   3. Test all functionality (login, admin, child views)"
    echo "   4. Update any remaining manual imports if needed"
    
    echo -e "\n${PURPLE}🎯 New Import Examples:${NC}"
    echo "   import { Avatar, Button, Card } from './components/common';"
    echo "   import { BehaviorCard, PointsBadge } from './components/shared';"
    echo "   import { Header, Navigation } from './components/layout';"
    echo "   import { AdminDashboard, ChildInterface } from './pages';"
}

# Main execution
main() {
    echo -e "\n${PURPLE}🚀 Starting Component Reorganization...${NC}\n"
    
    # Check if we're in the right directory
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        error "This doesn't appear to be a React project directory!"
        error "Please run this script from your project root."
        exit 1
    fi
    
    # Create backup
    create_backup
    
    try_step() {
        local step_name="$1"
        local step_func="$2"
        
        log "Step: $step_name"
        if $step_func; then
            success "✅ $step_name completed"
        else
            error "❌ $step_name failed"
            return 1
        fi
        echo ""
    }
    
    # Execute all steps
    try_step "Create Common Components" create_common_components
    try_step "Create Shared Components" create_shared_components  
    try_step "Create Layout Components" create_layout_components
    try_step "Create Barrel Exports" create_barrel_exports
    try_step "Move Page Components" move_page_components
    try_step "Remove Duplicate Files" remove_duplicate_files
    try_step "Update App.jsx" update_app_jsx
    
    # Final report
    generate_report
    
    echo -e "\n${GREEN}🎉 Component Reorganization Complete! 🎉${NC}"
    echo -e "\n${BLUE}💡 Don't forget to test your application with: npm start${NC}"
}

# Run the script
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi