// src/components/AdminDashboard.jsx - Enhanced with CRUD features + API Integration
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  GiftOutlined,
  TrophyOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import api from "../services/api";

// Mock Data - Extended from existing structure
const mockFamilies = [
  {
    Id: "F001",
    Name: "ครอบครัวมีสุข",
    Email: "meesuk@email.com",
    Phone: "081-234-5678",
    AvatarPath: "👨‍👩‍👧‍👦",
    IsActive: true,
    CreatedAt: "2024-01-01",
  },
  {
    Id: "F002",
    Name: "ครอบครัวสุขใส",
    Email: "suksai@email.com",
    Phone: "082-345-6789",
    AvatarPath: "👪",
    IsActive: true,
    CreatedAt: "2024-01-15",
  },
];

const mockChildren = [
  {
    Id: "C001",
    FamilyId: "F001",
    Name: "น้องพีฟ่า",
    Age: 11,
    Gender: "F",
    AvatarPath: "👧",
    currentPoints: 47,
    IsActive: true,
    CreatedAt: "2024-01-01",
  },
  {
    Id: "C002",
    FamilyId: "F001",
    Name: "น้องพีฟอง",
    Age: 10,
    Gender: "M",
    AvatarPath: "👦",
    currentPoints: 35,
    IsActive: true,
    CreatedAt: "2024-01-01",
  },
];

const mockBehaviors = [
  {
    Id: "B001",
    FamilyId: "F001",
    Name: "แปรงฟัน",
    Points: 3,
    Color: "#FF8CC8",
    Category: "สุขภาพ",
    Type: "Good",
    IsRepeatable: true,
    IsActive: true,
  },
  {
    Id: "B002",
    FamilyId: "F001",
    Name: "เก็บของเล่น",
    Points: 2,
    Color: "#87CEEB",
    Category: "ความรับผิดชอบ",
    Type: "Good",
    IsRepeatable: true,
    IsActive: true,
  },
  {
    Id: "B003",
    FamilyId: "F001",
    Name: "ไม่เก็บของเล่น",
    Points: -2,
    Color: "#FFB6C1",
    Category: "ไม่รับผิดชอบ",
    Type: "Bad",
    IsRepeatable: true,
    IsActive: true,
  },
];

const mockRewards = [
  {
    Id: "R001",
    FamilyId: "F001",
    Name: "ไอศกรีม",
    Cost: 10,
    Color: "#FFE4B5",
    Category: "ขนม",
    IsActive: true,
  },
  {
    Id: "R002",
    FamilyId: "F001",
    Name: "ของเล่นใหม่",
    Cost: 50,
    Color: "#E6E6FA",
    Category: "ของเล่น",
    IsActive: true,
  },
];

// Enhanced Admin Dashboard with CRUD
const AdminDashboard = ({
  family = mockFamilies[0],
  onLogout = () => {},
  onSelectChild = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("children");
  const [loading, setLoading] = useState(false);

  // Ensure we have a valid family object
  const currentFamily = family || mockFamilies[0];

  // Data states - เริ่มต้นด้วย empty arrays
  const [familyData, setFamilyData] = useState({
    children: [],
    totalPoints: 0,
  });
  const [familyBehaviors, setFamilyBehaviors] = useState([]);
  const [familyRewards, setFamilyRewards] = useState([]);

  // Modal states
  const [showChildModal, setShowChildModal] = useState(false);
  const [showBehaviorModal, setShowBehaviorModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [childForm, setChildForm] = useState({
    Name: "",
    Age: "",
    Gender: "M",
    AvatarPath: "",
  });
  const [behaviorForm, setBehaviorForm] = useState({
    Name: "",
    Points: "",
    Color: "#FF8CC8",
    Category: "",
    Type: "Good",
    IsRepeatable: true,
  });
  const [rewardForm, setRewardForm] = useState({
    Name: "",
    Cost: "",
    Color: "#FFE4B5",
    Category: "",
  });

  // Get filtered data for current family (with safety checks)
  const currentFamilyData = familyData.children.filter(
    (child) =>
      (child.familyId || child.FamilyId) ===
        (currentFamily.id || currentFamily.Id) &&
      child.isActive !== false &&
      child.IsActive !== false
  );
  const currentFamilyBehaviors = familyBehaviors.filter(
    (behavior) =>
      (behavior.familyId || behavior.FamilyId) ===
        (currentFamily.id || currentFamily.Id) &&
      behavior.isActive !== false &&
      behavior.IsActive !== false
  );
  const currentFamilyRewards = familyRewards.filter(
    (reward) =>
      (reward.familyId || reward.FamilyId) ===
        (currentFamily.id || currentFamily.Id) &&
      reward.isActive !== false &&
      reward.IsActive !== false
  );

  useEffect(() => {
    if (currentFamily.id || currentFamily.Id) {
      loadFamilyData();
    }
  }, [currentFamily.id || currentFamily.Id]);

  const loadFamilyData = async () => {
    try {
      setLoading(true);

      // เรียก API จริงแทน mock data - ใช้ field name ที่ถูกต้อง
      const familyId = currentFamily.id || currentFamily.Id;
      const [children, behaviors, rewards] = await Promise.all([
        api.getChildren(familyId),
        api.getBehaviors(familyId),
        api.getRewards(familyId),
      ]);

      // ประมวลผลข้อมูลเด็กและคะแนน (ตามรูปแบบของเดิม)
      const processedChildren = currentFamily.children || children || [];
      const processedBehaviors = behaviors || [];
      const processedRewards = rewards || [];

      // คำนวณคะแนนรวมจากข้อมูลจริง
      const totalPoints = processedChildren.reduce(
        (sum, child) => sum + (child.currentPoints || child.CurrentPoints || 0),
        0
      );

      setFamilyData({ children: processedChildren, totalPoints });
      setFamilyBehaviors(processedBehaviors);
      setFamilyRewards(processedRewards);
    } catch (error) {
      console.error("Error loading family data:", error);

      // Fallback ใช้ข้อมูลที่มีจาก family prop (ตามรูปแบบของเดิม)
      const fallbackChildren = currentFamily.children || [];
      const fallbackTotalPoints = fallbackChildren.reduce(
        (sum, child) => sum + (child.currentPoints || child.CurrentPoints || 0),
        0
      );

      setFamilyData({
        children: fallbackChildren,
        totalPoints: fallbackTotalPoints,
      });

      // ใช้ mock data สำหรับ behaviors และ rewards
      const familyId = currentFamily.id || currentFamily.Id;
      setFamilyBehaviors(
        mockBehaviors.filter(
          (b) =>
            (b.familyId || b.FamilyId) === familyId &&
            b.isActive !== false &&
            b.IsActive !== false
        )
      );
      setFamilyRewards(
        mockRewards.filter(
          (r) =>
            (r.familyId || r.FamilyId) === familyId &&
            r.isActive !== false &&
            r.IsActive !== false
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Family Form Modal
  const FamilyFormModal = () => {
    const handleSubmit = () => {
      if (!familyForm.Name || !familyForm.Email) {
        alert("กรุณากรอกชื่อครอบครัวและอีเมล");
        return;
      }

      if (editingItem) {
        setFamilies(
          families.map((fam) =>
            fam.Id === editingItem.Id ? { ...fam, ...familyForm } : fam
          )
        );
      } else {
        const newFamily = {
          Id: `F${String(families.length + 1).padStart(3, "0")}`,
          ...familyForm,
          AvatarPath: familyForm.AvatarPath || "👨‍👩‍👧‍👦",
          IsActive: true,
          CreatedAt: new Date().toISOString().split("T")[0],
        };
        setFamilies([...families, newFamily]);
      }
      setShowFamilyModal(false);
      setEditingItem(null);
      setFamilyForm({ Name: "", Email: "", Phone: "", AvatarPath: "" });
    };

    return (
      <Modal
        open={showFamilyModal}
        onCancel={() => {
          setShowFamilyModal(false);
          setEditingItem(null);
          setFamilyForm({ Name: "", Email: "", Phone: "", AvatarPath: "" });
        }}
        title={editingItem ? "แก้ไขข้อมูลครอบครัว" : "สร้างครอบครัวใหม่"}
        okText="บันทึก"
        cancelText="ยกเลิก"
        onOk={handleSubmit}
      >
        <Form layout="vertical">
          <Form.Item label="ชื่อครอบครัว" required>
            <Input
              value={familyForm.Name}
              onChange={(e) =>
                setFamilyForm({ ...familyForm, Name: e.target.value })
              }
              placeholder="กรุณากรอกชื่อครอบครัว"
            />
          </Form.Item>

          <Form.Item label="อีเมล" required>
            <Input
              type="email"
              value={familyForm.Email}
              onChange={(e) =>
                setFamilyForm({ ...familyForm, Email: e.target.value })
              }
              placeholder="example@email.com"
            />
          </Form.Item>

          <Form.Item label="เบอร์โทรศัพท์">
            <Input
              type="tel"
              value={familyForm.Phone}
              onChange={(e) =>
                setFamilyForm({ ...familyForm, Phone: e.target.value })
              }
              placeholder="081-234-5678"
            />
          </Form.Item>

          <Form.Item label="Emoji ครอบครัว">
            <Input
              value={familyForm.AvatarPath}
              onChange={(e) =>
                setFamilyForm({ ...familyForm, AvatarPath: e.target.value })
              }
              placeholder="👨‍👩‍👧‍👦"
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  // Child Form Modal
  const ChildFormModal = () => {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
      try {
        const values = await form.validateFields();

        setLoading(true);

        if (editingItem) {
          // Update existing child via API
          const updatedChild = {
            ...editingItem,
            ...values,
            Age: parseInt(values.Age),
          };

          await api.updateChild(editingItem.id || editingItem.Id, updatedChild);

          const updatedChildren = familyData.children.map((child) =>
            (child.id || child.Id) === (editingItem.id || editingItem.Id)
              ? updatedChild
              : child
          );
          setFamilyData({ ...familyData, children: updatedChildren });
        } else {
          // Create new child via API
          const newChild = {
            FamilyId: currentFamily.Id,
            ...values,
            Age: parseInt(values.Age),
            AvatarPath:
              values.AvatarPath || (values.Gender === "M" ? "👦" : "👧"),
            currentPoints: 0,
            IsActive: true,
          };

          const createdChild = await api.createChild(newChild);

          setFamilyData({
            ...familyData,
            children: [
              ...familyData.children,
              createdChild || { ...newChild, Id: `C${Date.now()}` },
            ],
          });
        }

        setShowChildModal(false);
        setEditingItem(null);
        setChildForm({ Name: "", Age: "", Gender: "M", AvatarPath: "" });
        message.success("บันทึกข้อมูลสำเร็จ");
      } catch (error) {
        console.error("Error saving child:", error);
        alert("เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่");
      } finally {
        setLoading(false);
      }
    };

    return (
      <Modal
        open={showChildModal}
        onCancel={() => {
          setShowChildModal(false);
          setEditingItem(null);
          setChildForm({ Name: "", Age: "", Gender: "M", AvatarPath: "" });
        }}
        title={editingItem ? "แก้ไขข้อมูลเด็ก" : "เพิ่มเด็กใหม่"}
        okText="บันทึก"
        cancelText="ยกเลิก"
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="ชื่อเด็ก"
            name="Name"
            rules={[{ required: true, message: "กรุณากรอกชื่อเด็ก" }]}
          >
            <Input placeholder="กรุณากรอกชื่อเด็ก" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="อายุ"
              name="Age"
              rules={[{ required: true, message: "กรุณากรอกอายุ" }]}
            >
              <Input type="number" placeholder="อายุ" min="1" max="18" />
            </Form.Item>

            <Form.Item
              label="เพศ"
              name="Gender"
              rules={[{ required: true, message: "เลือกเพศ" }]}
            >
              <Select
                options={[
                  { value: "M", label: "ชาย" },
                  { value: "F", label: "หญิง" },
                ]}
                placeholder="เลือกเพศ"
              />
            </Form.Item>
          </div>

          <Form.Item label="Emoji เด็ก" name="AvatarPath">
            <Input
              placeholder={`เช่น ${
                childForm.Gender === "M" ? "👦 หรือ 🧒" : "👧 หรือ 👶"
              }`}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  // Behavior Form Modal
  const BehaviorFormModal = () => {
    const handleSubmit = async () => {
      if (!behaviorForm.Name || !behaviorForm.Points) {
        alert("กรุณากรอกชื่อพฤติกรรมและคะแนน");
        return;
      }

      try {
        setLoading(true);

        const formData = {
          ...behaviorForm,
          Points:
            parseInt(behaviorForm.Points) *
            (behaviorForm.Type === "Bad" ? -1 : 1),
        };

        if (editingItem) {
          // Update existing behavior via API
          const updatedBehavior = { ...editingItem, ...formData };
          await api.updateBehavior(
            editingItem.id || editingItem.Id,
            updatedBehavior
          );

          setFamilyBehaviors(
            familyBehaviors.map((behavior) =>
              (behavior.id || behavior.Id) ===
              (editingItem.id || editingItem.Id)
                ? updatedBehavior
                : behavior
            )
          );
        } else {
          // Create new behavior via API
          const newBehavior = {
            FamilyId: currentFamily.id || currentFamily.Id,
            ...formData,
            IsActive: true,
          };

          const createdBehavior = await api.createBehavior(newBehavior);

          setFamilyBehaviors([
            ...familyBehaviors,
            createdBehavior || { ...newBehavior, Id: `B${Date.now()}` },
          ]);
        }
      } catch (error) {
        console.error("Error saving behavior:", error);
        alert("เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่");
        return;
      } finally {
        setLoading(false);
      }

      setShowBehaviorModal(false);
      setEditingItem(null);
      setBehaviorForm({
        Name: "",
        Points: "",
        Color: "#FF8CC8",
        Category: "",
        Type: "Good",
        IsRepeatable: true,
      });
    };

    const categories = [
      { value: "สุขภาพ", label: "สุขภาพ" },
      { value: "ความรับผิดชอบ", label: "ความรับผิดชอบ" },
      { value: "การเรียนรู้", label: "การเรียนรู้" },
      { value: "ช่วยเหลือ", label: "ช่วยเหลือ" },
      { value: "พฤติกรรม", label: "พฤติกรรม" },
      { value: "อื่นๆ", label: "อื่นๆ" },
    ];

    return (
      <Modal
        open={showBehaviorModal}
        onCancel={() => {
          setShowBehaviorModal(false);
          setEditingItem(null);
          setBehaviorForm({
            Name: "",
            Points: "",
            Color: "#FF8CC8",
            Category: "",
            Type: "Good",
            IsRepeatable: true,
          });
        }}
        title={editingItem ? "แก้ไขพฤติกรรม" : "เพิ่มพฤติกรรมใหม่"}
        okText="บันทึก"
        cancelText="ยกเลิก"
        onOk={handleSubmit}
      >
        <Form layout="vertical">
          <Form.Item label="ชื่อพฤติกรรม" required>
            <Input
              value={behaviorForm.Name}
              onChange={(e) =>
                setBehaviorForm({ ...behaviorForm, Name: e.target.value })
              }
              placeholder="กรุณากรอกชื่อพฤติกรรม"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="ประเภท"
              name="Type"
              rules={[{ required: true, message: "เลือกประเภท" }]}
            >
              <Select
                options={[
                  { value: "Good", label: "พฤติกรรมดี" },
                  { value: "Bad", label: "พฤติกรรมไม่ดี" },
                ]}
                placeholder="เลือกประเภท"
              />
            </Form.Item>

            <Form.Item
              label="คะแนน"
              name="Points"
              rules={[{ required: true, message: "กรุณากรอกคะแนน" }]}
            >
              <Input type="number" placeholder="กรอกจำนวนคะแนน" min="1" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="หมวดหมู่" name="Category">
              <Select options={categories} placeholder="เลือกหมวดหมู่" />
            </Form.Item>

            <Form.Item label="สี" name="Color">
              <Input type="color" placeholder="เลือกสี" />
            </Form.Item>
          </div>

          <Form.Item label="">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={behaviorForm.IsRepeatable}
                onChange={(e) =>
                  setBehaviorForm({
                    ...behaviorForm,
                    IsRepeatable: e.target.checked,
                  })
                }
                className="rounded"
              />
              <span className="text-sm text-gray-700">สามารถทำซ้ำได้</span>
            </label>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  // Reward Form Modal
  const RewardFormModal = () => {
    const handleSubmit = async () => {
      if (!rewardForm.Name || !rewardForm.Cost) {
        alert("กรุณากรอกชื่อรางวัลและราคา");
        return;
      }

      try {
        setLoading(true);

        const formData = {
          ...rewardForm,
          Cost: parseInt(rewardForm.Cost),
        };

        if (editingItem) {
          // Update existing reward via API
          const updatedReward = { ...editingItem, ...formData };
          await api.updateReward(
            editingItem.id || editingItem.Id,
            updatedReward
          );

          setFamilyRewards(
            familyRewards.map((reward) =>
              (reward.id || reward.Id) === (editingItem.id || editingItem.Id)
                ? updatedReward
                : reward
            )
          );
        } else {
          // Create new reward via API
          const newReward = {
            FamilyId: currentFamily.id || currentFamily.Id,
            ...formData,
            IsActive: true,
          };

          const createdReward = await api.createReward(newReward);

          setFamilyRewards([
            ...familyRewards,
            createdReward || { ...newReward, Id: `R${Date.now()}` },
          ]);
        }
      } catch (error) {
        console.error("Error saving reward:", error);
        alert("เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่");
        return;
      } finally {
        setLoading(false);
      }

      setShowRewardModal(false);
      setEditingItem(null);
      setRewardForm({ Name: "", Cost: "", Color: "#FFE4B5", Category: "" });
    };

    const categories = [
      { value: "ขนม", label: "ขนม" },
      { value: "ของเล่น", label: "ของเล่น" },
      { value: "กิจกรรม", label: "กิจกรรม" },
      { value: "เงิน", label: "เงิน" },
      { value: "อื่นๆ", label: "อื่นๆ" },
    ];

    return (
      <Modal
        open={showRewardModal}
        onCancel={() => {
          setShowRewardModal(false);
          setEditingItem(null);
          setRewardForm({ Name: "", Cost: "", Color: "#FFE4B5", Category: "" });
        }}
        title={editingItem ? "แก้ไขรางวัล" : "เพิ่มรางวัลใหม่"}
        okText="บันทึก"
        cancelText="ยกเลิก"
        onOk={handleSubmit}
      >
        <Form layout="vertical">
          <Form.Item label="ชื่อรางวัล" required>
            <Input
              value={rewardForm.Name}
              onChange={(e) =>
                setRewardForm({ ...rewardForm, Name: e.target.value })
              }
              placeholder="กรุณากรอกชื่อรางวัล"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="ราคา (คะแนน)"
              name="Cost"
              rules={[{ required: true, message: "กรุณากรอกราคา" }]}
            >
              <Input
                type="number"
                placeholder="กรอกจำนวนคะแนนที่ใช้แลก"
                min="1"
              />
            </Form.Item>

            <Form.Item label="หมวดหมู่" name="Category">
              <Select options={categories} placeholder="เลือกหมวดหมู่" />
            </Form.Item>
          </div>

          <Form.Item label="สี" name="Color">
            <Input type="color" placeholder="เลือกสี" />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  // Edit handlers
  const handleEditChild = (child) => {
    setEditingItem(child);
    setChildForm({
      Name: child.name || child.Name,
      Age: (child.age || child.Age).toString(),
      Gender: child.gender || child.Gender,
      AvatarPath: child.avatarPath || child.AvatarPath || "",
    });
    setShowChildModal(true);
  };

  const handleEditBehavior = (behavior) => {
    setEditingItem(behavior);
    setBehaviorForm({
      Name: behavior.name || behavior.Name,
      Points: Math.abs(behavior.points || behavior.Points).toString(),
      Color: behavior.color || behavior.Color,
      Category: behavior.category || behavior.Category,
      Type: behavior.type || behavior.Type,
      IsRepeatable: behavior.isRepeatable || behavior.IsRepeatable,
    });
    setShowBehaviorModal(true);
  };

  const handleEditReward = (reward) => {
    setEditingItem(reward);
    setRewardForm({
      Name: reward.name || reward.Name,
      Cost: (reward.cost || reward.Cost).toString(),
      Color: reward.color || reward.Color,
      Category: reward.category || reward.Category,
    });
    setShowRewardModal(true);
  };

  // Delete handlers
  const handleDeleteChild = async (child) => {
    if (confirm(`ต้องการลบ ${child.name || child.Name} หรือไม่?`)) {
      try {
        setLoading(true);

        // Soft delete via API
        await api.deleteChild(child.id || child.Id);

        const updatedChildren = familyData.children.map((c) =>
          (c.id || c.Id) === (child.id || child.Id)
            ? { ...c, IsActive: false, isActive: false }
            : c
        );
        setFamilyData({ ...familyData, children: updatedChildren });
      } catch (error) {
        console.error("Error deleting child:", error);
        alert("เกิดข้อผิดพลาดในการลบ กรุณาลองใหม่");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteBehavior = async (behavior) => {
    if (
      confirm(`ต้องการลบพฤติกรรม "${behavior.name || behavior.Name}" หรือไม่?`)
    ) {
      try {
        setLoading(true);

        // Soft delete via API
        await api.deleteBehavior(behavior.id || behavior.Id);

        setFamilyBehaviors(
          familyBehaviors.map((b) =>
            (b.id || b.Id) === (behavior.id || behavior.Id)
              ? { ...b, IsActive: false, isActive: false }
              : b
          )
        );
      } catch (error) {
        console.error("Error deleting behavior:", error);
        alert("เกิดข้อผิดพลาดในการลบ กรุณาลองใหม่");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteReward = async (reward) => {
    if (confirm(`ต้องการลบรางวัล "${reward.name || reward.Name}" หรือไม่?`)) {
      try {
        setLoading(true);

        // Soft delete via API
        await api.deleteReward(reward.id || reward.Id);

        setFamilyRewards(
          familyRewards.map((r) =>
            (r.id || r.Id) === (reward.id || reward.Id)
              ? { ...r, IsActive: false, isActive: false }
              : r
          )
        );
      } catch (error) {
        console.error("Error deleting reward:", error);
        alert("เกิดข้อผิดพลาดในการลบ กรุณาลองใหม่");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar
            size={64}
            style={{ background: "#e6f7ff", color: "#1890ff", fontSize: 32 }}
          >
            {(family.AvatarPath || family.Name || "👨‍👩‍👧‍👦").toString().slice(0, 2)}
          </Avatar>
          <div>
            <div style={{ fontWeight: "bold", fontSize: 20 }}>
              {family.Name}
            </div>
            <div>{family.Email}</div>
            <div>{family.Phone}</div>
          </div>
          <Button
            type="primary"
            style={{ marginLeft: "auto" }}
            onClick={onLogout}
          >
            ออกจากระบบ
          </Button>
        </div>
      </Card>

      <div style={{ margin: "24px 0" }}>
        <Button.Group>
          <Button
            type={activeTab === "children" ? "primary" : "default"}
            onClick={() => setActiveTab("children")}
          >
            เด็กในครอบครัว
          </Button>
          <Button
            type={activeTab === "behaviors" ? "primary" : "default"}
            onClick={() => setActiveTab("behaviors")}
          >
            พฤติกรรม
          </Button>
          <Button
            type={activeTab === "rewards" ? "primary" : "default"}
            onClick={() => setActiveTab("rewards")}
          >
            รางวัล
          </Button>
        </Button.Group>
      </div>

      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          {activeTab === "children" && (
            <>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={showChildModalHandler}
                style={{ marginBottom: 16 }}
              >
                เพิ่มเด็ก
              </Button>
              {currentFamilyData.map(renderChildCard)}
              <Modal
                open={showChildModal}
                onCancel={() => setShowChildModal(false)}
                title="เพิ่ม/แก้ไขข้อมูลเด็ก"
                onOk={handleChildSubmit}
                okText="บันทึก"
                cancelText="ยกเลิก"
              >
                <Form form={form} layout="vertical">
                  <Form.Item
                    label="ชื่อ"
                    name="Name"
                    rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="อายุ"
                    name="Age"
                    rules={[{ required: true, message: "กรุณากรอกอายุ" }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                  <Form.Item
                    label="เพศ"
                    name="Gender"
                    rules={[{ required: true, message: "เลือกเพศ" }]}
                  >
                    <Select
                      options={[
                        { value: "M", label: "ชาย" },
                        { value: "F", label: "หญิง" },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label="Emoji เด็ก" name="AvatarPath">
                    <Input />
                  </Form.Item>
                </Form>
              </Modal>
            </>
          )}

          {activeTab === "behaviors" && (
            <>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setShowBehaviorModal(true)}
                style={{ marginBottom: 16 }}
              >
                เพิ่มพฤติกรรม
              </Button>
              {currentFamilyBehaviors.map(renderBehaviorCard)}
              <Modal
                open={showBehaviorModal}
                onCancel={() => setShowBehaviorModal(false)}
                title="เพิ่ม/แก้ไขพฤติกรรม"
                onOk={handleSubmit}
                okText="บันทึก"
                cancelText="ยกเลิก"
              >
                <Form layout="vertical">
                  <Form.Item label="ชื่อพฤติกรรม" required>
                    <Input
                      value={behaviorForm.Name}
                      onChange={(e) =>
                        setBehaviorForm({
                          ...behaviorForm,
                          Name: e.target.value,
                        })
                      }
                      placeholder="กรุณากรอกชื่อพฤติกรรม"
                    />
                  </Form.Item>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      label="ประเภท"
                      name="Type"
                      rules={[{ required: true, message: "เลือกประเภท" }]}
                    >
                      <Select
                        options={[
                          { value: "Good", label: "พฤติกรรมดี" },
                          { value: "Bad", label: "พฤติกรรมไม่ดี" },
                        ]}
                        placeholder="เลือกประเภท"
                      />
                    </Form.Item>

                    <Form.Item
                      label="คะแนน"
                      name="Points"
                      rules={[{ required: true, message: "กรุณากรอกคะแนน" }]}
                    >
                      <Input
                        type="number"
                        placeholder="กรอกจำนวนคะแนน"
                        min="1"
                      />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="หมวดหมู่" name="Category">
                      <Select
                        options={categories}
                        placeholder="เลือกหมวดหมู่"
                      />
                    </Form.Item>

                    <Form.Item label="สี" name="Color">
                      <Input type="color" placeholder="เลือกสี" />
                    </Form.Item>
                  </div>

                  <Form.Item label="">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={behaviorForm.IsRepeatable}
                        onChange={(e) =>
                          setBehaviorForm({
                            ...behaviorForm,
                            IsRepeatable: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">
                        สามารถทำซ้ำได้
                      </span>
                    </label>
                  </Form.Item>
                </Form>
              </Modal>
            </>
          )}

          {activeTab === "rewards" && (
            <>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setShowRewardModal(true)}
                style={{ marginBottom: 16 }}
              >
                เพิ่มรางวัล
              </Button>
              {currentFamilyRewards.map(renderRewardCard)}
              <Modal
                open={showRewardModal}
                onCancel={() => setShowRewardModal(false)}
                title="เพิ่ม/แก้ไขรางวัล"
                onOk={handleSubmit}
                okText="บันทึก"
                cancelText="ยกเลิก"
              >
                <Form layout="vertical">
                  <Form.Item label="ชื่อรางวัล" required>
                    <Input
                      value={rewardForm.Name}
                      onChange={(e) =>
                        setRewardForm({ ...rewardForm, Name: e.target.value })
                      }
                      placeholder="กรุณากรอกชื่อรางวัล"
                    />
                  </Form.Item>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      label="ราคา (คะแนน)"
                      name="Cost"
                      rules={[{ required: true, message: "กรุณากรอกราคา" }]}
                    >
                      <Input
                        type="number"
                        placeholder="กรอกจำนวนคะแนนที่ใช้แลก"
                        min="1"
                      />
                    </Form.Item>

                    <Form.Item label="หมวดหมู่" name="Category">
                      <Select
                        options={categories}
                        placeholder="เลือกหมวดหมู่"
                      />
                    </Form.Item>
                  </div>

                  <Form.Item label="สี" name="Color">
                    <Input type="color" placeholder="เลือกสี" />
                  </Form.Item>
                </Form>
              </Modal>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
