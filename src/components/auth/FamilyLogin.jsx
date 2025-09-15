// src/components/auth/FamilyLogin.jsx
// Family Login Component using updated API
import React, { useState, useEffect } from 'react';
import { getFamilies, loginFamily } from '../../services/api.js';

const FamilyLogin = ({ onLogin }) => {
  const [families, setFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      const data = await getFamilies();
      setFamilies(data);
    } catch (err) {
      setError('Failed to load families');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!selectedFamily || !password) {
      setError('Please select family and enter password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const family = families.find(f => f.Id === selectedFamily);
      const result = await loginFamily(family.Email, password);
      onLogin(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🌈 My Kids</h1>
          <p className="text-gray-600">เข้าสู่ระบบครอบครัว</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลือกครอบครัว
            </label>
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">-- เลือกครอบครัว --</option>
              {families.map(family => (
                <option key={family.Id} value={family.Id}>
                  {family.AvatarPath} {family.Name} ({family.childrenCount} คน)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ใส่รหัสผ่าน (demo: password)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>ครอบครัวตัวอย่าง - รหัสผ่าน: password</p>
        </div>
      </div>
    </div>
  );
};
export default FamilyLogin;
