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
