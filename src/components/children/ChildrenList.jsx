// src/components/children/ChildrenList.jsx
// Children List Component using updated API
import React, { useState, useEffect } from "react";
import { getChildren } from "../../services/api.js";

const ChildCard = ({ child, onClick }) => (
  <div
    onClick={() => onClick(child)}
    className="card-bg-glass rounded-2xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-purple-200"
  >
    <div className="text-center">
      <div className="text-6xl mb-4">{child.AvatarPath}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{child.Name}</h3>
      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
        <span>อายุ {child.Age} ปี</span>
        <span>{child.Gender === "M" ? "ชาย" : "หญิง"}</span>
      </div>
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3">
        <div className="text-2xl font-bold text-purple-600">
          {child.currentPoints || 0}
        </div>
        <div className="text-sm text-gray-600">คะแนน</div>
      </div>
    </div>
  </div>
);

const ChildrenList = ({ familyId, onChildSelect }) => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (familyId) {
      loadChildren();
    }
  }, [familyId]);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const data = await getChildren(familyId);
      setChildren(data);
    } catch (err) {
      setError("Failed to load children");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        เลือกลูกน้อย 👶
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child) => (
          <ChildCard key={child.Id} child={child} onClick={onChildSelect} />
        ))}
      </div>

      {children.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <div className="text-6xl mb-4">👶</div>
          <p>ยังไม่มีลูกน้อยในครอบครัว</p>
        </div>
      )}
    </div>
  );
};
export default ChildrenList;
