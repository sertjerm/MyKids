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
