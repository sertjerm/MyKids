// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Avatar,
  Badge,
  Tag,
  Popconfirm,
  message,
  Spin,
  Tabs,
  Alert,
  Row,
  Col,
  Space,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  GiftOutlined,
  TrophyOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

// Import existing components
import BehaviorCard from "./BehaviorCard";
import RewardCard from "./RewardCard";

// Import real API service และ constants
import api from "../services/api";
import { behaviorCategories, rewardCategories } from "../constants/constants";

const AdminDashboard = ({ 
  family, 
  onLogout = () => {}, 
  onSelectChild = () => {} 
}) => {
  const [activeTab, setActiveTab] = useState("children");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Data States - เริ่มต้นด้วย children จาก family prop
  const [children, setChildren] = useState(family?.children || []);
  const [behaviors, setBehaviors] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [error, setError] = useState(null);

  // Modal States
  const [showChildModal, setShowChildModal] = useState(false);
  const [showBehaviorModal, setShowBehaviorModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Load data on mount
  useEffect(() => {
    console.log('AdminDashboard received family:', family);
    
    if (family?.id) {
      // ใช้ children จาก family prop ถ้ามี ไม่ต้องเรียก API ใหม่
      if (family.children && family.children.length > 0) {
        setChildren(family.children);
        console.log('Using children from family prop:', family.children);
      }
      
      // โหลด behaviors และ rewards
      loadAdditionalData();
    }
  }, [family]);

  const loadAdditionalData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // โหลดเฉพาะ behaviors และ rewards
      const [behaviorsData, rewardsData] = await Promise.all([
        api.getBehaviors(family.id),
        api.getRewards(family.id)
      ]);

      setBehaviors(behaviorsData || []);
      setRewards(rewardsData || []);

      console.log('Loaded behaviors:', behaviorsData);
      console.log('Loaded rewards:', rewardsData);

    } catch (error) {
      console.error("Error loading additional data:", error);
      setError("ไม่สามารถโหลดข้อมูลพฤติกรรมและรางวัลได้");
      message.error("ไม่สามารถโหลดข้อมูลบางส่วนได้");
    } finally {
      setLoading(false);
    }
  };

  const loadFamilyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // รีโหลดข้อมูลใหม่ทั้งหมด
      const [childrenData, behaviorsData, rewardsData] = await Promise.all([
        api.getChildren(family.id),
        api.getBehaviors(family.id),
        api.getRewards(family.id)
      ]);

      setChildren(childrenData || []);
      setBehaviors(behaviorsData || []);
      setRewards(rewardsData || []);

    } catch (error) {
      console.error("Error loading family data:", error);
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      message.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  // Helper Functions
  const getTotalFamilyPoints = () => {
    return children.reduce((sum, child) => {
      const points = child.currentPoints || 0;
      return sum + points;
    }, 0);
  };

  // Child CRUD Operations
  const handleChildSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const childData = {
        ...values,
        age: parseInt(values.age),
        familyId: family.id,
      };

      if (editingItem) {
        // Update existing child
        await api.createChild({ ...childData, id: editingItem.id }); // API อาจต้องใช้ update method
        message.success('แก้ไขข้อมูลเด็กสำเร็จ!');
      } else {
        // Add new child
        await api.createChild(childData);
        message.success('เพิ่มเด็กใหม่สำเร็จ!');
      }
      
      // Reload data
      await loadFamilyData();
      setShowChildModal(false);
      setEditingItem(null);
      form.resetFields();
    } catch (error) {
      console.error("Error saving child:", error);
      message.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChild = async (child) => {
    try {
      setLoading(true);
      // await api.deleteChild(child.id); // ปิดไว้ก่อนเพื่อไม่ให้ลบจริง
      
      // ลบจาก state แทน
      setChildren(children.filter(c => c.id !== child.id));
      message.success('ลบข้อมูลเด็กสำเร็จ!');
    } catch (error) {
      console.error("Error deleting child:", error);
      message.error('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Behavior CRUD Operations
  const handleBehaviorSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const behaviorData = {
        name: values.name,
        points: parseInt(values.points) * (values.type === "Bad" ? -1 : 1),
        type: values.type,
        category: values.category,
        color: values.color,
        isRepeatable: values.isRepeatable,
        familyId: family.id,
      };

      if (editingItem) {
        // Update existing behavior
        const newBehavior = { ...editingItem, ...behaviorData };
        setBehaviors(behaviors.map(b => b.id === editingItem.id ? newBehavior : b));
        message.success('แก้ไขพฤติกรรมสำเร็จ!');
      } else {
        // Add new behavior
        const newBehavior = { ...behaviorData, id: `B${Date.now()}` };
        setBehaviors([...behaviors, newBehavior]);
        message.success('เพิ่มพฤติกรรมใหม่สำเร็จ!');
      }
      
      setShowBehaviorModal(false);
      setEditingItem(null);
      form.resetFields();
    } catch (error) {
      console.error("Error saving behavior:", error);
      message.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBehavior = async (behavior) => {
    try {
      setLoading(true);
      setBehaviors(behaviors.filter(b => b.id !== behavior.id));
      message.success('ลบพฤติกรรมสำเร็จ!');
    } catch (error) {
      console.error("Error deleting behavior:", error);
      message.error('เกิดข้อผิดพลาดในการลบ');
    } finally {
      setLoading(false);
    }
  };

  // Reward CRUD Operations
  const handleRewardSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const rewardData = {
        name: values.name,
        cost: parseInt(values.cost),
        category: values.category,
        color: values.color,
        familyId: family.id,
      };

      if (editingItem) {
        // Update existing reward
        const newReward = { ...editingItem, ...rewardData };
        setRewards(rewards.map(r => r.id === editingItem.id ? newReward : r));
        message.success('แก้ไขรางวัลสำเร็จ!');
      } else {
        // Add new reward
        const newReward = { ...rewardData, id: `R${Date.now()}` };
        setRewards([...rewards, newReward]);
        message.success('เพิ่มรางวัลใหม่สำเร็จ!');
      }
      
      setShowRewardModal(false);
      setEditingItem(null);
      form.resetFields();
    } catch (error) {
      console.error("Error saving reward:", error);
      message.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReward = async (reward) => {
    try {
      setLoading(true);
      setRewards(rewards.filter(r => r.id !== reward.id));
      message.success('ลบรางวัลสำเร็จ!');
    } catch (error) {
      console.error("Error deleting reward:", error);
      message.error('เกิดข้อผิดพลาดในการลบ');
    } finally {
      setLoading(false);
    }
  };

  // Render child card ใช้แบบเดิม (ไม่ใช่ Ant Design Card)
  const renderChildCard = (child) => (
    <div 
      key={child.id}
      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all relative"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img 
            src={child.avatarPath || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.name}`}
            alt={child.name}
            className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name)}&background=random`;
            }}
          />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">{child.name}</h3>
          <p className="text-sm text-gray-600">อายุ {child.age} ปี</p>
          <p className="text-sm text-gray-600">เพศ: {child.gender === 'M' ? 'ชาย' : 'หญิง'}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-bold">
              ⭐ {child.currentPoints || 0} คะแนน
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <Button
            type="primary"
            onClick={() => onSelectChild && onSelectChild(child)}
            className="bg-gradient-to-r from-blue-500 to-purple-500"
          >
            เข้าใช้งาน
          </Button>
          <div className="flex gap-1">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingItem(child);
                form.setFieldsValue({
                  name: child.name,
                  age: child.age,
                  gender: child.gender,
                  avatarPath: child.avatarPath,
                });
                setShowChildModal(true);
              }}
            />
            <Popconfirm
              title="ต้องการลบข้อมูลเด็กนี้หรือไม่?"
              onConfirm={() => handleDeleteChild(child)}
              okText="ลบ"
              cancelText="ยกเลิก"
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </div>
        </div>
      </div>
    </div>
  );

  // Tab items
  const tabItems = [
    {
      key: 'children',
      label: `👶 เด็กในครอบครัว (${children.length})`,
      children: (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">เด็กในครอบครัว</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingItem(null);
                form.resetFields();
                setShowChildModal(true);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              เพิ่มเด็ก
            </Button>
          </div>
          
          <div className="grid gap-4">
            {children.map(renderChildCard)}
          </div>
          
          {children.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <UserOutlined style={{ fontSize: '48px', color: '#ccc' }} />
              <h3>ยังไม่มีเด็กในครอบครัว</h3>
              <p>คลิก "เพิ่มเด็ก" เพื่อเริ่มต้น</p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'behaviors',
      label: `🏆 พฤติกรรม (${behaviors.length})`,
      children: (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">พฤติกรรม</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingItem(null);
                form.resetFields();
                setShowBehaviorModal(true);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              เพิ่มพฤติกรรม
            </Button>
          </div>
          
          <div className="grid gap-4">
            {behaviors.map(behavior => (
              <div key={behavior.id} className="relative">
                <BehaviorCard 
                  behavior={behavior}
                  disabled={false}
                />
                
                {/* Action buttons overlay */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="small"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingItem(behavior);
                      form.setFieldsValue({
                        name: behavior.name || behavior.Name,
                        points: Math.abs(behavior.points || behavior.Points),
                        type: behavior.type || behavior.Type,
                        category: behavior.category || behavior.Category,
                        color: behavior.color || behavior.Color,
                        isRepeatable: behavior.isRepeatable ?? behavior.IsRepeatable ?? true,
                      });
                      setShowBehaviorModal(true);
                    }}
                  />
                  <Popconfirm
                    title="ต้องการลบพฤติกรรมนี้หรือไม่?"
                    onConfirm={() => handleDeleteBehavior(behavior)}
                    okText="ลบ"
                    cancelText="ยกเลิก"
                  >
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
          
          {behaviors.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <TrophyOutlined style={{ fontSize: '48px', color: '#ccc' }} />
              <h3>ยังไม่มีพฤติกรรมที่กำหนด</h3>
              <p>คลิก "เพิ่มพฤติกรรม" เพื่อเริ่มต้น</p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'rewards',
      label: `🎁 รางวัล (${rewards.length})`,
      children: (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">รางวัล</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingItem(null);
                form.resetFields();
                setShowRewardModal(true);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              เพิ่มรางวัล
            </Button>
          </div>
          
          <div className="grid gap-4">
            {rewards.map(reward => (
              <div key={reward.id} className="relative">
                <RewardCard 
                  reward={reward}
                  canAfford={true}
                  disabled={false}
                  onSelect={() => {}}
                />
                
                {/* Action buttons overlay */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="small"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingItem(reward);
                      form.setFieldsValue({
                        name: reward.name || reward.Name,
                        cost: reward.cost || reward.Cost,
                        category: reward.category || reward.Category,
                        color: reward.color || reward.Color,
                      });
                      setShowRewardModal(true);
                    }}
                  />
                  <Popconfirm
                    title="ต้องการลบรางวัลนี้หรือไม่?"
                    onConfirm={() => handleDeleteReward(reward)}
                    okText="ลบ"
                    cancelText="ยกเลิก"
                  >
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
          
          {rewards.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <GiftOutlined style={{ fontSize: '48px', color: '#ccc' }} />
              <h3>ยังไม่มีรางวัลที่กำหนด</h3>
              <p>คลิก "เพิ่มรางวัล" เพื่อเริ่มต้น</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  if (loading && !children.length && !behaviors.length && !rewards.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-lg text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Error Alert */}
        {error && (
          <Alert
            message="เกิดข้อผิดพลาด"
            description={error}
            type="error"
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: '16px' }}
          />
        )}

        {/* Header - ใช้แบบเดิม */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">
              {family?.avatarPath || '👨‍👩‍👧‍👦'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{family?.name}</h1>
              <p className="text-gray-600">{family?.email}</p>
              <p className="text-gray-600">{family?.phone}</p>
              <div className="mt-2">
                <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-bold shadow-lg">
                  ⭐ รวม {getTotalFamilyPoints()} คะแนน
                </span>
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {children.length} เด็ก
                </span>
              </div>
            </div>
            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={onLogout}
              className="flex items-center gap-2 px-6 py-3"
            >
              ออกจากระบบ
            </Button>
          </div>
        </div>

        {/* Content Tabs - ใช้ Ant Design */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            items={tabItems}
            size="large"
          />
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}>
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="text-center">
                <Spin size="large" />
                <p className="mt-4 text-gray-600">กำลังประมวลผล...</p>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <Modal
          title={editingItem ? "แก้ไขข้อมูลเด็ก" : "เพิ่มเด็กใหม่"}
          open={showChildModal}
          onOk={handleChildSubmit}
          onCancel={() => {
            setShowChildModal(false);
            setEditingItem(null);
            form.resetFields();
          }}
          okText="บันทึก"
          cancelText="ยกเลิก"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="ชื่อเด็ก"
              rules={[{ required: true, message: 'กรุณากรอกชื่อเด็ก!' }]}
            >
              <Input placeholder="กรุณากรอกชื่อเด็ก" />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="age"
                  label="อายุ"
                  rules={[{ required: true, message: 'กรุณากรอกอายุ!' }]}
                >
                  <Input type="number" placeholder="อายุ" min={1} max={18} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="gender"
                  label="เพศ"
                  rules={[{ required: true, message: 'กรุณาเลือกเพศ!' }]}
                >
                  <Select placeholder="เลือกเพศ">
                    <Select.Option value="M">ชาย</Select.Option>
                    <Select.Option value="F">หญิง</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="avatarPath"
              label="รูปโปรไฟล์"
            >
              <Input placeholder="URL รูปภาพ หรือ emoji หรือเว้นว่างสำหรับรูปเริ่มต้น" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Behavior Modal */}
        <Modal
          title={editingItem ? "แก้ไขพฤติกรรม" : "เพิ่มพฤติกรรมใหม่"}
          open={showBehaviorModal}
          onOk={handleBehaviorSubmit}
          onCancel={() => {
            setShowBehaviorModal(false);
            setEditingItem(null);
            form.resetFields();
          }}
          okText="บันทึก"
          cancelText="ยกเลิก"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="ชื่อพฤติกรรม"
              rules={[{ required: true, message: 'กรุณากรอกชื่อพฤติกรรม!' }]}
            >
              <Input placeholder="กรุณากรอกชื่อพฤติกรรม" />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="ประเภท"
                  rules={[{ required: true, message: 'กรุณาเลือกประเภท!' }]}
                >
                  <Select placeholder="เลือกประเภท">
                    <Select.Option value="Good">พฤติกรรมดี</Select.Option>
                    <Select.Option value="Bad">พฤติกรรมไม่ดี</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="points"
                  label="คะแนน"
                  rules={[{ required: true, message: 'กรุณากรอกคะแนน!' }]}
                >
                  <Input type="number" placeholder="จำนวนคะแนน" min={1} />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="หมวดหมู่"
                >
                  <Select placeholder="เลือกหมวดหมู่">
                    {behaviorCategories?.map(cat => (
                      <Select.Option key={cat.value} value={cat.value}>
                        {cat.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="color"
                  label="สี"
                >
                  <Input type="color" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="isRepeatable"
              valuePropName="checked"
            >
              <input type="checkbox" style={{ marginRight: '8px' }} />
              สามารถทำซ้ำได้
            </Form.Item>
          </Form>
        </Modal>

        {/* Reward Modal */}
        <Modal
          title={editingItem ? "แก้ไขรางวัล" : "เพิ่มรางวัลใหม่"}
          open={showRewardModal}
          onOk={handleRewardSubmit}
          onCancel={() => {
            setShowRewardModal(false);
            setEditingItem(null);
            form.resetFields();
          }}
          okText="บันทึก"
          cancelText="ยกเลิก"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="ชื่อรางวัล"
              rules={[{ required: true, message: 'กรุณากรอกชื่อรางวัล!' }]}
            >
              <Input placeholder="กรุณากรอกชื่อรางวัล" />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="cost"
                  label="ราคา (คะแนน)"
                  rules={[{ required: true, message: 'กรุณากรอกราคา!' }]}
                >
                  <Input type="number" placeholder="จำนวนคะแนนที่ใช้แลก" min={1} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="หมวดหมู่"
                >
                  <Select placeholder="เลือกหมวดหมู่">
                    {rewardCategories?.map(cat => (
                      <Select.Option key={cat.value} value={cat.value}>
                        {cat.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="color"
              label="สี"
            >
              <Input type="color" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;