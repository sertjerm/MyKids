// src/components/LoginPage.jsx
import React, { useState } from "react";
import { Users } from "lucide-react";
import { mockFamilies, getChildrenByFamily } from "../data/mockData";
import {Avatar} from 'antd'

const LoginPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (family) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      onLogin(family);
    } catch (error) {
      console.error("Login failed:", error);
      alert("เข้าสู่ระบบไม่สำเร็จ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card-bg-glass rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">MyKids Tracker</h1>
          <p className="text-gray-600">เลือกครอบครัวของคุณ</p>
        </div>

        <div className="space-y-4">
          {mockFamilies.map((family) => (
            <button
              key={family.Id}
              onClick={() => handleLogin(family)}
              disabled={loading}
              className="w-full p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-colors duration-200 flex items-center gap-4 disabled:opacity-50"
            >
              <Avatar emoji={family.AvatarPath} size="md" />
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-800">{family.Name}</h3>
                <p className="text-sm text-gray-600">{family.Email}</p>
                <p className="text-xs text-gray-500">
                  {getChildrenByFamily(family.Id).length} คน
                </p>
              </div>
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>🎮 Demo Mode - เลือกครอบครัวใดก็ได้เพื่อทดลองใช้งาน</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
