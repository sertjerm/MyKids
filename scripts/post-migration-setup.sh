#!/bin/bash

# post-migration-setup.sh - สคริปต์ปรับแต่งหลัง migrate เป็น Ant Design
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

# Function to create enhanced BehaviorCard with Ant Design
create_enhanced_behavior_card() {
    local file="$COMPONENTS_DIR/shared/BehaviorCard.jsx"
    
    log_info "Creating enhanced BehaviorCard with Ant Design components..."
    
    mkdir -p "$COMPONENTS_DIR/shared"
    
cat > "$file" << 'EOF'
// src/components/shared/BehaviorCard.jsx
import React from 'react';
import { Card, Avatar, Tag, Button, Typography, Badge } from 'antd';
import { 
  HeartOutlined, 
  WarningOutlined, 
  StarOutlined,
  TrophyOutlined,
  RepeatOutlined 
} from '@ant-design/icons';

const { Text, Title } = Typography;

/**
 * BehaviorCard Component with Ant Design - แสดงข้อมูลพฤติกรรม
 * รองรับ Admin และ Child view modes
 */
const BehaviorCard = ({ 
  behavior, 
  onSelect = () => {}, 
  selected = false, 
  disabled = false, 
  showPoints = true,
  showCategory = true,
  mode = 'child', // 'admin', 'child', 'compact'
  className = '',
  children
}) => {
  if (!behavior) return null;

  const isGood = behavior.Type === 'Good';
  const points = behavior.Points || 0;
  const isRepeatable = behavior.IsRepeatable;

  // Card styling based on behavior type and selection state
  const cardProps = {
    hoverable: !disabled,
    size: mode === 'compact' ? 'small' : 'default',
    className: `behavior-card ${isGood ? 'behavior-good' : 'behavior-bad'} ${selected ? 'selected' : ''} ${className}`,
    style: {
      borderColor: selected 
        ? (isGood ? '#52c41a' : '#ff4d4f')
        : (isGood ? '#b7eb8f' : '#ffadd6'),
      borderWidth: selected ? 2 : 1,
      backgroundColor: disabled 
        ? '#f5f5f5' 
        : (isGood ? '#f6ffed' : '#fff2e8'),
      opacity: disabled ? 0.6 : 1,
      transform: selected ? 'scale(1.02)' : 'scale(1)',
      boxShadow: selected 
        ? (isGood ? '0 4px 16px rgba(82, 196, 26, 0.3)' : '0 4px 16px rgba(255, 77, 79, 0.3)')
        : undefined
    },
    onClick: disabled ? undefined : () => onSelect(behavior)
  };

  // Icon selection based on behavior type
  const BehaviorIcon = isGood ? HeartOutlined : WarningOutlined;

  return (
    <Card {...cardProps}>
      <div className="flex items-start gap-3">
        {/* Behavior Icon & Color Indicator */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <Badge 
            dot 
            color={behavior.Color}
            size="large"
          >
            <Avatar
              size={mode === 'compact' ? 'small' : 'default'}
              icon={<BehaviorIcon />}
              style={{ 
                backgroundColor: behavior.Color,
                color: 'white'
              }}
            />
          </Badge>
          
          {/* Repeatable indicator */}
          {isRepeatable && mode !== 'compact' && (
            <RepeatOutlined 
              className="text-gray-400" 
              style={{ fontSize: '12px' }}
              title="ทำซ้ำได้"
            />
          )}
        </div>

        {/* Behavior Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <Title 
              level={mode === 'compact' ? 5 : 4} 
              className="mb-0 line-clamp-2"
              style={{ color: isGood ? '#52c41a' : '#ff4d4f' }}
            >
              {behavior.Name}
            </Title>
            
            {/* Points Display */}
            {showPoints && (
              <Tag
                color={isGood ? 'success' : 'error'}
                icon={<StarOutlined />}
                className="ml-2 font-bold"
              >
                {isGood ? '+' : ''}{points}
              </Tag>
            )}
          </div>

          {/* Category */}
          {showCategory && behavior.Category && (
            <Tag color="geekblue" className="mb-2">
              {behavior.Category}
            </Tag>
          )}

          {/* Description */}
          {behavior.Description && mode !== 'compact' && (
            <Text type="secondary" className="text-sm">
              {behavior.Description}
            </Text>
          )}

          {/* Admin Mode Additional Info */}
          {mode === 'admin' && (
            <div className="mt-3 flex items-center gap-2">
              <Tag color={isRepeatable ? 'blue' : 'default'}>
                {isRepeatable ? 'ทำซ้ำได้' : 'ครั้งเดียว'}
              </Tag>
              
              {behavior.MaxPerDay && (
                <Tag color="orange">
                  สูงสุด {behavior.MaxPerDay} ครั้ง/วัน
                </Tag>
              )}
              
              <Tag color={behavior.IsActive ? 'success' : 'default'}>
                {behavior.IsActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
              </Tag>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons for Admin Mode */}
      {mode === 'admin' && children && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {children}
        </div>
      )}
    </Card>
  );
};

export default BehaviorCard;
EOF

    log_success "Enhanced BehaviorCard created with Ant Design components"
}

# Function to create enhanced ChildCard
create_enhanced_child_card() {
    local file="$COMPONENTS_DIR/shared/ChildCard.jsx"
    
    log_info "Creating enhanced ChildCard with Ant Design components..."
    
cat > "$file" << 'EOF'
// src/components/shared/ChildCard.jsx
import React from 'react';
import { Card, Avatar, Typography, Tag, Progress, Button, Space, Badge } from 'antd';
import { 
  UserOutlined, 
  StarOutlined, 
  TrophyOutlined, 
  SmileOutlined,
  HeartOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

/**
 * ChildCard Component with Ant Design - แสดงข้อมูลเด็กและคะแนน
 */
const ChildCard = ({
  child,
  currentPoints = 0,
  todayPoints = 0,
  totalActivities = 0,
  onSelect = () => {},
  selected = false,
  mode = 'card', // 'card', 'compact', 'dashboard'
  showProgress = true,
  showStats = true,
  className = '',
  actions = []
}) => {
  if (!child) return null;

  // Calculate progress percentage (example: towards 100 points)
  const progressPercent = Math.min((currentPoints / 100) * 100, 100);
  
  // Card styling
  const cardProps = {
    hoverable: true,
    className: `child-card ${selected ? 'selected' : ''} ${className}`,
    style: {
      borderColor: selected ? '#1890ff' : '#d9d9d9',
      borderWidth: selected ? 2 : 1,
      backgroundColor: selected ? '#f0f7ff' : '#ffffff',
      transform: selected ? 'scale(1.02)' : 'scale(1)'
    },
    onClick: () => onSelect(child)
  };

  // Avatar with fallback to initials
  const avatarProps = {
    size: mode === 'compact' ? 48 : 64,
    src: child.AvatarPath,
    icon: !child.AvatarPath ? <UserOutlined /> : null,
    style: {
      backgroundColor: !child.AvatarPath ? '#87d068' : undefined,
      fontSize: mode === 'compact' ? '16px' : '20px'
    }
  };

  // Generate initials if no avatar
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  return (
    <Card {...cardProps}>
      <div className={`flex ${mode === 'compact' ? 'items-center gap-3' : 'flex-col items-center text-center gap-4'}`}>
        
        {/* Avatar Section */}
        <div className="relative">
          <Badge 
            count={todayPoints > 0 ? `+${todayPoints}` : 0}
            showZero={false}
            style={{ backgroundColor: '#52c41a' }}
          >
            <Avatar {...avatarProps}>
              {!child.AvatarPath && getInitials(child.Name)}
            </Avatar>
          </Badge>
          
          {/* Status indicator */}
          {child.IsActive && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Child Info */}
        <div className={`flex-1 ${mode === 'compact' ? 'text-left' : 'text-center'}`}>
          <Title 
            level={mode === 'compact' ? 4 : 3} 
            className="mb-1"
            style={{ color: '#1890ff' }}
          >
            {child.Name}
          </Title>
          
          {child.Age && (
            <Text type="secondary">อายุ {child.Age} ปี</Text>
          )}

          {/* Points Display */}
          <div className={`mt-2 ${mode === 'compact' ? 'flex items-center gap-4' : 'space-y-2'}`}>
            <div className="flex items-center justify-center gap-1">
              <StarOutlined style={{ color: '#faad14' }} />
              <Text strong className="text-lg">
                {currentPoints} คะแนน
              </Text>
            </div>
            
            {showProgress && mode !== 'compact' && (
              <Progress
                percent={progressPercent}
                size="small"
                status={progressPercent >= 100 ? 'success' : 'active'}
                showInfo={false}
                strokeColor={{
                  '0%': '#87d068',
                  '100%': '#108ee9',
                }}
              />
            )}
          </div>

          {/* Stats Tags */}
          {showStats && (
            <div className={`mt-3 ${mode === 'compact' ? 'flex gap-2' : 'flex flex-wrap justify-center gap-2'}`}>
              {todayPoints !== 0 && (
                <Tag 
                  color={todayPoints > 0 ? 'success' : 'error'}
                  icon={<HeartOutlined />}
                >
                  วันนี้ {todayPoints > 0 ? '+' : ''}{todayPoints}
                </Tag>
              )}
              
              {totalActivities > 0 && (
                <Tag color="blue" icon={<TrophyOutlined />}>
                  {totalActivities} กิจกรรม
                </Tag>
              )}
              
              {progressPercent >= 100 && (
                <Tag color="gold" icon={<SmileOutlined />}>
                  เก่งมาก!
                </Tag>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {actions.length > 0 && (
          <div className={`${mode === 'compact' ? 'ml-auto' : 'w-full mt-3'}`}>
            <Space size="small" wrap>
              {actions}
            </Space>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChildCard;
EOF

    log_success "Enhanced ChildCard created"
}

# Function to create custom CSS for Ant Design theming
create_custom_antd_styles() {
    local css_file="$SRC_DIR/styles/antd-custom.css"
    
    log_info "Creating custom Ant Design styles..."
    
    mkdir -p "$SRC_DIR/styles"
    
cat > "$css_file" << 'EOF'
/* src/styles/antd-custom.css */
/* Custom Ant Design styles for My-Kids Management System */

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
  background: linear-gradient(135deg, #a855f7 0%, #d946ef 100%);
  border: none;
}

.ant-btn-primary:hover {
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
}

.ant-modal-body {
  padding: 24px;
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

/* Custom animations */
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
EOF

    # Update main CSS file to import custom styles
    local main_css="$SRC_DIR/styles/global.css"
    if [[ -f "$main_css" ]]; then
        echo "" >> "$main_css"
        echo "/* Ant Design Custom Styles */" >> "$main_css"
        echo "@import './antd-custom.css';" >> "$main_css"
        log_success "Added custom Ant Design styles import to global.css"
    fi
    
    log_success "Custom Ant Design styles created"
}

# Function to create utility hooks for Ant Design
create_antd_hooks() {
    local hooks_dir="$SRC_DIR/hooks"
    
    log_info "Creating utility hooks for Ant Design..."
    
    mkdir -p "$hooks_dir"
    
    # Notification hook
cat > "$hooks_dir/useNotification.js" << 'EOF'
// src/hooks/useNotification.js
import { notification } from 'antd';
import { 
  CheckCircleOutlined, 
  WarningOutlined, 
  InfoCircleOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';

/**
 * Custom hook for showing notifications with kid-friendly styling
 */
export const useNotification = () => {
  const showSuccess = (title, message, duration = 4) => {
    notification.success({
      message: title,
      description: message,
      duration,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      style: {
        borderRadius: '16px',
        boxShadow: '0 8px 25px rgba(82, 196, 26, 0.3)',
      }
    });
  };

  const showError = (title, message, duration = 4) => {
    notification.error({
      message: title,
      description: message,
      duration,
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      style: {
        borderRadius: '16px',
        boxShadow: '0 8px 25px rgba(255, 77, 79, 0.3)',
      }
    });
  };

  const showWarning = (title, message, duration = 4) => {
    notification.warning({
      message: title,
      description: message,
      duration,
      icon: <WarningOutlined style={{ color: '#faad14' }} />,
      style: {
        borderRadius: '16px',
        boxShadow: '0 8px 25px rgba(250, 173, 20, 0.3)',
      }
    });
  };

  const showInfo = (title, message, duration = 4) => {
    notification.info({
      message: title,
      description: message,
      duration,
      icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
      style: {
        borderRadius: '16px',
        boxShadow: '0 8px 25px rgba(24, 144, 255, 0.3)',
      }
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useNotification;
EOF

    # Message hook
cat > "$hooks_dir/useMessage.js" << 'EOF'
// src/hooks/useMessage.js
import { message } from 'antd';

/**
 * Custom hook for showing messages with consistent styling
 */
export const useMessage = () => {
  // Configure global message settings
  message.config({
    top: 100,
    duration: 3,
    maxCount: 3,
  });

  const showSuccess = (content, duration = 3) => {
    return message.success({
      content,
      duration,
      style: {
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '500',
      }
    });
  };

  const showError = (content, duration = 3) => {
    return message.error({
      content,
      duration,
      style: {
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '500',
      }
    });
  };

  const showWarning = (content, duration = 3) => {
    return message.warning({
      content,
      duration,
      style: {
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '500',
      }
    });
  };

  const showInfo = (content, duration = 3) => {
    return message.info({
      content,
      duration,
      style: {
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '500',
      }
    });
  };

  const showLoading = (content, duration = 0) => {
    return message.loading({
      content,
      duration,
      style: {
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '500',
      }
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading
  };
};

export default useMessage;
EOF

    log_success "Utility hooks created"
}

# Function to create example usage components
create_example_components() {
    local examples_dir="$COMPONENTS_DIR/examples"
    
    log_info "Creating example components with Ant Design..."
    
    mkdir -p "$examples_dir"
    
    # Example dashboard component
cat > "$examples_dir/ExampleDashboard.jsx" << 'EOF'
// src/components/examples/ExampleDashboard.jsx
import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Avatar,
  Button,
  Space,
  Progress,
  Tag,
  Badge,
  Typography,
  Divider
} from 'antd';
import {
  UserOutlined,
  StarOutlined,
  TrophyOutlined,
  HeartOutlined,
  SmileOutlined,
  GiftOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * Example Dashboard showing how to use Ant Design components
 * in the My-Kids Management System
 */
const ExampleDashboard = () => {
  const [selectedChild, setSelectedChild] = useState('child1');

  // Mock data
  const children = [
    {
      id: 'child1',
      name: 'น้องพีฟ่า',
      age: 11,
      avatar: 'https://ui-avatars.com/api/?name=PF&background=87d068&color=fff',
      points: 85,
      todayPoints: 12,
      activities: 15
    },
    {
      id: 'child2', 
      name: 'น้องพีฟอง',
      age: 10,
      avatar: 'https://ui-avatars.com/api/?name=PFO&background=1890ff&color=fff',
      points: 92,
      todayPoints: 8,
      activities: 18
    }
  ];

  const currentChild = children.find(c => c.id === selectedChild);

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <Title level={2} className="mb-2">
            🏠 แดชบอร์ดครอบครัว
          </Title>
          <Text type="secondary">
            ติดตามความก้าวหน้าและพฤติกรรมของลูกๆ
          </Text>
        </div>

        {/* Child Selection */}
        <Card className="mb-6">
          <Title level={4} className="mb-4">เลือกลูก</Title>
          <Space size="large">
            {children.map(child => (
              <Card
                key={child.id}
                hoverable
                className={`cursor-pointer ${selectedChild === child.id ? 'border-blue-400 shadow-lg' : ''}`}
                style={{ 
                  borderWidth: selectedChild === child.id ? 2 : 1,
                  minWidth: 200
                }}
                onClick={() => setSelectedChild(child.id)}
              >
                <div className="text-center">
                  <Badge 
                    count={child.todayPoints > 0 ? `+${child.todayPoints}` : 0}
                    showZero={false}
                    style={{ backgroundColor: '#52c41a' }}
                  >
                    <Avatar 
                      size={64} 
                      src={child.avatar}
                      icon={<UserOutlined />}
                    />
                  </Badge>
                  
                  <div className="mt-3">
                    <Title level={4} className="mb-1">
                      {child.name}
                    </Title>
                    <Text type="secondary">อายุ {child.age} ปี</Text>
                    
                    <div className="mt-2 flex justify-center gap-2">
                      <Tag color="blue" icon={<StarOutlined />}>
                        {child.points} คะแนน
                      </Tag>
                      <Tag color="green" icon={<TrophyOutlined />}>
                        {child.activities} กิจกรรม
                      </Tag>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </Space>
        </Card>

        {/* Stats Overview */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="คะแนนรวม"
                value={currentChild?.points}
                prefix={<StarOutlined style={{ color: '#faad14' }} />}
                suffix="คะแนน"
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="คะแนนวันนี้"
                value={currentChild?.todayPoints}
                prefix={<HeartOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: currentChild?.todayPoints > 0 ? '#52c41a' : '#cf1322' }}
                suffix="คะแนน"
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="กิจกรรมทั้งหมด"
                value={currentChild?.activities}
                prefix={<TrophyOutlined style={{ color: '#1890ff' }} />}
                suffix="กิจกรรม"
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="ความก้าวหน้า"
                value={Math.min((currentChild?.points / 100) * 100, 100)}
                prefix={<SmileOutlined style={{ color: '#722ed1' }} />}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        {/* Progress Section */}
        <Card title="ความก้าวหน้า" className="mb-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <Text>เป้าหมายรายเดือน (100 คะแนน)</Text>
                <Text strong>{currentChild?.points}/100 คะแนน</Text>
              </div>
              <Progress
                percent={Math.min((currentChild?.points / 100) * 100, 100)}
                status={currentChild?.points >= 100 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#87d068',
                  '100%': '#108ee9',
                }}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Text>กิจกรรมรายสัปดาห์ (20 กิจกรรม)</Text>
                <Text strong>{currentChild?.activities}/20 กิจกรรม</Text>
              </div>
              <Progress
                percent={Math.min((currentChild?.activities / 20) * 100, 100)}
                status={currentChild?.activities >= 20 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#722ed1',
                  '100%': '#eb2f96',
                }}
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card title="การดำเนินการ">
          <Space size="large" wrap>
            <Button 
              type="primary" 
              icon={<HeartOutlined />} 
              size="large"
            >
              บันทึกพฤติกรรมดี
            </Button>
            
            <Button 
              type="default" 
              icon={<GiftOutlined />} 
              size="large"
            >
              แลกรางวัล
            </Button>
            
            <Button 
              type="dashed" 
              icon={<TrophyOutlined />} 
              size="large"
            >
              ดูประวัติ
            </Button>
          </Space>
        </Card>

      </div>
    </div>
  );
};

export default ExampleDashboard;
EOF

    log_success "Example components created"
}

# Function to update package.json scripts
update_package_scripts() {
    log_info "Updating package.json scripts..."
    
    # Add useful scripts for development
    npm pkg set scripts.antd-theme="antd-tools theme generate"
    npm pkg set scripts.analyze="npm run build && npx webpack-bundle-analyzer build/static/js/*.js"
    
    log_success "Package scripts updated"
}

# Main execution function
main() {
    log_info "Starting post-migration setup for Ant Design..."
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]] || [[ ! -d "$SRC_DIR" ]]; then
        log_error "This doesn't appear to be a React project root. Please run from the project root directory."
        exit 1
    fi
    
    # Check if Ant Design is installed
    if ! grep -q '"antd"' package.json; then
        log_warning "Ant Design not found in package.json. Please run migrate-to-antd.sh first."
        exit 1
    fi
    
    # Execute post-migration steps
    create_enhanced_behavior_card
    create_enhanced_child_card
    create_custom_antd_styles
    create_antd_hooks
    create_example_components
    update_package_scripts
    
    log_success "🎉 Post-migration setup completed successfully!"
    log_info "New components created:"
    log_info "  - Enhanced BehaviorCard with Ant Design"
    log_info "  - Enhanced ChildCard with Ant Design" 
    log_info "  - Custom Ant Design styles"
    log_info "  - Utility hooks (useNotification, useMessage)"
    log_info "  - Example dashboard component"
    log_info ""
    log_info "Next steps:"
    log_info "  1. Review and test the new components"
    log_info "  2. Update your existing components to use the new enhanced versions"
    log_info "  3. Customize the theme in src/config/antdConfig.js as needed"
    log_info "  4. Run 'npm start' to see the changes"
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi