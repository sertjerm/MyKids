// Quick Fix for handleChildSubmit function
// Add this to your AdminDashboard component

// เพิ่ม handleChildSubmit function ใน AdminDashboard component
const handleChildSubmit = async () => {
  try {
    const values = await form.validateFields();
    
    if (editingItem) {
      // แก้ไขเด็กที่มีอยู่
      const updatedChildren = familyData.children.map(child =>
        child.Id === editingItem.Id 
          ? { 
              ...child, 
              ...values, 
              Age: parseInt(values.Age),
              AvatarPath: values.AvatarPath || (values.Gender === "M" ? "👦" : "👧")
            } 
          : child
      );
      setFamilyData({ ...familyData, children: updatedChildren });
      
    } else {
      // เพิ่มเด็กใหม่
      const newChild = {
        Id: `C${Date.now()}`, // สร้าง ID ใหม่
        FamilyId: currentFamily.Id,
        ...values,
        Age: parseInt(values.Age),
        AvatarPath: values.AvatarPath || (values.Gender === "M" ? "👦" : "👧"),
        currentPoints: 0,
        CurrentPoints: 0, // สำหรับ compatibility
        IsActive: true,
        CreatedAt: new Date().toISOString().split('T')[0]
      };
      
      setFamilyData({
        ...familyData,
        children: [...familyData.children, newChild]
      });
    }
    
    // ปิด modal และ reset form
    setShowChildModal(false);
    setEditingItem(null);
    form.resetFields();
    
    // แสดง success message (ถ้ามี antd message)
    if (typeof message !== 'undefined') {
      message.success(editingItem ? 'แก้ไขข้อมูลสำเร็จ!' : 'เพิ่มเด็กใหม่สำเร็จ!');
    }
    
  } catch (error) {
    console.error('Error saving child:', error);
    
    // แสดง error message
    if (typeof message !== 'undefined') {
      message.error('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่');
    } else {
      alert('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่');
    }
  }
};

// หากไม่มี Form instance ให้เพิ่ม:
const [form] = Form.useForm();

// ตรวจสอบว่า import Form จาก antd แล้ว:
// import { Form, Input, Select, Modal, Button, message } from 'antd';

// หาก Modal มี onOk={handleChildSubmit} แล้วก็ใช้ function นี้ได้เลย