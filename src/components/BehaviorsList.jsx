// src/components/BehaviorList.jsx
import React, { useState, useEffect } from "react";
import { Heart, Plus, Minus, Square, CheckSquare } from "lucide-react";

// Mock Data - ตามโครงสร้างจริงของ database
const mockBehaviors = [
  {
    Id: "B003",
    FamilyId: "F001",
    Name: "อ่านหนังสือ",
    Description: "อ่านหนังสือก่อนนอน",
    Points: "5",
    Color: "#A78BFA",
    Category: "การเรียนรู้",
    Type: "Good",
    IsRepeatable: "0",
    MaxPerDay: null,
    IsActive: "1",
  },
  {
    Id: "B004",
    FamilyId: "F001",
    Name: "ช่วยงานบ้าน",
    Description: "ช่วยงานบ้าน",
    Points: "4",
    Color: "#FBBF24",
    Category: "ความรับผิดชอบ",
    Type: "Good",
    IsRepeatable: "0",
    MaxPerDay: null,
    IsActive: "1",
  },
  {
    Id: "B002",
    FamilyId: "F001",
    Name: "เก็บของเล่น",
    Description: "เก็บของเล่นหลังเล่น",
    Points: "2",
    Color: "#60A5FA",
    Category: "ความรับผิดชอบ",
    Type: "Good",
    IsRepeatable: "0",
    MaxPerDay: null,
    IsActive: "1",
  },
  {
    Id: "B229",
    FamilyId: "F001",
    Name: "ช่วยล้างจาน",
    Description: "ช่วยล้างจาน",
    Points: "5",
    Color: "#34D399",
    Category: "งานบ้าน",
    Type: "Good",
    IsRepeatable: "1",
    MaxPerDay: null,
    IsActive: "1",
  },
  {
    Id: "B005",
    FamilyId: "F001",
    Name: "ไหว้สวย",
    Description: "ไหว้สวยมาก",
    Points: "8",
    Color: "#FB7185",
    Category: "มารยาท",
    Type: "Good",
    IsRepeatable: "0",
    MaxPerDay: null,
    IsActive: "1",
  },
  {
    Id: "B001",
    FamilyId: "F001",
    Name: "แปรงฟัน",
    Description: "แปรงฟันเช้า-เย็น",
    Points: "3",
    Color: "#4ADE80",
    Category: "สุขภาพ",
    Type: "Good",
    IsRepeatable: "0",
    MaxPerDay: null,
    IsActive: "1",
  },
];

const BehaviorItem = ({ behavior, count, onUpdateCount }) => {
  const isRepeatable = behavior.IsRepeatable === "1";
  const points = parseInt(behavior.Points);

  const handleDecrement = () => {
    if (count > 0) {
      onUpdateCount(behavior.Id, count - 1);
    }
  };

  const handleIncrement = () => {
    onUpdateCount(behavior.Id, count + 1);
  };

  const handleToggle = () => {
    // สำหรับพฤติกรรมที่ทำได้ครั้งเดียว ให้ toggle ระหว่าง 0 กับ 1
    onUpdateCount(behavior.Id, count === 0 ? 1 : 0);
  };

  return (
    <div className="card-bg-glass rounded-xl p-4 shadow-sm border-2 border-gray-100">
      {/* Single row layout */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Color indicator */}
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: behavior.Color }}
          />

          {/* Behavior info */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-800">{behavior.Name}</div>
            <div className="text-sm text-gray-500">{behavior.Description}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Points */}
          <div
            className={`font-bold text-lg ${
              points > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {points > 0 ? "+" : ""}
            {points}
          </div>

          {/* Today's count with 'x' - เฉพาะพฤติกรรมที่ทำซ้ำได้ */}
          {isRepeatable && (
            <div className="text-gray-500 text-sm">{count}x</div>
          )}

          {/* Control buttons - แยกตาม IsRepeatable */}
          {isRepeatable ? (
            // สำหรับพฤติกรรมที่ทำซ้ำได้ - ใช้ปุ่ม +/-
            <div className="flex items-center gap-1">
              <button
                onClick={handleDecrement}
                disabled={count === 0}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-gray-600 transition-colors"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={handleIncrement}
                className="w-8 h-8 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center text-green-600 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            // สำหรับพฤติกรรมที่ทำได้ครั้งเดียว - ใช้ checkbox ขนาดใหญ่
            <button
              onClick={handleToggle}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                count > 0
                  ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              {count > 0 ? <CheckSquare size={32} /> : <Square size={32} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const BehaviorList = () => {
  const [behaviors, setBehaviors] = useState(mockBehaviors);
  const [counts, setCounts] = useState({});

  // Initialize counts
  useEffect(() => {
    const initialCounts = {};
    behaviors.forEach((behavior) => {
      initialCounts[behavior.Id] = 0;
    });
    setCounts(initialCounts);
  }, [behaviors]);

  const handleUpdateCount = (behaviorId, newCount) => {
    setCounts((prevCounts) => ({
      ...prevCounts,
      [behaviorId]: newCount,
    }));
  };

  const goodBehaviors = behaviors.filter(
    (b) => b.Type === "Good" && b.IsActive === "1"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Heart className="text-green-500" size={24} />
          <h2 className="text-xl font-bold text-green-600">
            พฤติกรรมดี ({goodBehaviors.length} รายการ)
          </h2>
        </div>

        {/* Behavior List - Single Column */}
        <div className="space-y-4">
          {goodBehaviors.map((behavior) => (
            <BehaviorItem
              key={behavior.Id}
              behavior={behavior}
              count={counts[behavior.Id] || 0}
              onUpdateCount={handleUpdateCount}
            />
          ))}
        </div>

        {goodBehaviors.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <div className="text-6xl mb-4">😊</div>
            <p>ยังไม่มีพฤติกรรมดีในครอบครัว</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BehaviorList;
