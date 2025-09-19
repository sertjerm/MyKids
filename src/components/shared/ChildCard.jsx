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
