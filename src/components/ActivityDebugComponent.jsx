// src/components/ActivityDebugComponent.jsx
// Debug Component สำหรับติดตามและแก้ปัญหาการบันทึกกิจกรรม - แก้ไข infinite loop

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Bug, Send } from 'lucide-react';
import api from '../services/api';

const ActivityDebugComponent = ({ isVisible = false, onToggle }) => {
  const [testData, setTestData] = useState({
    childId: 'C001',
    itemId: 'B001',
    activityType: 'Good',
    points: 3,
    count: 1,
    note: 'ทดสอบจาก Debug Component'
  });

  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [childrenData, setChildrenData] = useState([]);
  const [behaviorsData, setBehaviorsData] = useState([]);

  // โหลดข้อมูลเด็กและพฤติกรรม - ใช้ useCallback เพื่อป้องกัน infinite loop
  const loadData = useCallback(async () => {
    try {
      console.log('🔄 Loading data for debug component...');
      
      // โหลดข้อมูลเด็ก
      const children = await api.children.getAll();
      setChildrenData(children || []);
      
      // โหลดพฤติกรรมดี
      const behaviors = await api.behaviors.getGood();
      setBehaviorsData(behaviors || []);
      
      console.log('✅ Debug data loaded:', { 
        childrenCount: children?.length || 0, 
        behaviorsCount: behaviors?.length || 0 
      });
      
    } catch (error) {
      console.error('❌ Failed to load debug data:', error);
    }
  }, []); // Empty dependency array เพื่อป้องกัน re-run

  // โหลดข้อมูลครั้งเดียวเมื่อ component mount
  useEffect(() => {
    if (isVisible && childrenData.length === 0) {
      loadData();
    }
  }, [isVisible, loadData, childrenData.length]);

  // อัพเดต testData เมื่อมีข้อมูล - ใช้ useCallback เพื่อป้องกัน infinite loop
  const updateTestData = useCallback(() => {
    if (childrenData.length > 0 && behaviorsData.length > 0) {
      const firstChild = childrenData[0];
      const firstBehavior = behaviorsData[0];
      
      setTestData(prev => ({
        ...prev,
        childId: firstChild.Id || firstChild.id || prev.childId,
        itemId: firstBehavior.Id || firstBehavior.id || prev.itemId,
        points: firstBehavior.Points || firstBehavior.points || prev.points
      }));
    }
  }, [childrenData, behaviorsData]);

  // เรียก updateTestData เมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    updateTestData();
  }, [updateTestData]);

  // ทดสอบการเชื่อมต่อ API
  const testApiConnection = useCallback(async () => {
    setIsLoading(true);
    const results = [];
    
    try {
      // Test 1: Health Check
      const healthResult = await api.health.check();
      results.push({
        test: 'Health Check',
        status: 'success',
        data: healthResult,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      results.push({
        test: 'Health Check',
        status: 'error',
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    try {
      // Test 2: Get Children
      const childrenResult = await api.children.getAll();
      results.push({
        test: 'Get Children',
        status: 'success',
        data: `Found ${childrenResult?.length || 0} children`,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      results.push({
        test: 'Get Children',
        status: 'error',
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    try {
      // Test 3: Get Behaviors
      const behaviorsResult = await api.behaviors.getGood();
      results.push({
        test: 'Get Good Behaviors',
        status: 'success',
        data: `Found ${behaviorsResult?.length || 0} behaviors`,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      results.push({
        test: 'Get Good Behaviors',
        status: 'error',
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    setTestResults(results);
    setIsLoading(false);
  }, []);

  // ทดสอบการบันทึกกิจกรรม
  const testCreateActivity = useCallback(async () => {
    setIsLoading(true);
    
    try {
      console.log('🧪 Testing activity creation with data:', testData);
      
      const activityData = {
        childId: testData.childId,
        itemId: testData.itemId,
        activityType: testData.activityType,
        points: testData.points,
        count: testData.count,
        note: testData.note,
        earnedPoints: testData.points * testData.count,
        activityDate: new Date().toISOString().split('T')[0]
      };

      console.log('🎯 Formatted activity data:', activityData);

      const result = await api.activities.create(activityData);
      
      setTestResults(prev => [...prev, {
        test: 'Create Activity',
        status: 'success',
        data: result,
        payload: activityData,
        timestamp: new Date().toLocaleTimeString()
      }]);

      console.log('✅ Activity creation success:', result);
      
    } catch (error) {
      console.error('❌ Activity creation failed:', error);
      
      setTestResults(prev => [...prev, {
        test: 'Create Activity',
        status: 'error',
        error: error.message,
        payload: testData,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
    
    setIsLoading(false);
  }, [testData]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors z-50"
        title="เปิด Debug Panel"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white border border-gray-300 rounded-lg shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5" />
          <span className="font-semibold">Debug Panel</span>
        </div>
        <button
          onClick={onToggle}
          className="text-gray-300 hover:text-white"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {/* API Connection Tests */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">API Connection Tests</h3>
          <button
            onClick={testApiConnection}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            ทดสอบการเชื่อมต่อ
          </button>
        </div>

        {/* Activity Creation Test */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Activity Creation Test</h3>
          
          {/* Test Data Form */}
          <div className="space-y-2 mb-3">
            <select
              value={testData.childId}
              onChange={(e) => setTestData(prev => ({ ...prev, childId: e.target.value }))}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="">เลือกเด็ก</option>
              {childrenData.map(child => (
                <option key={child.Id || child.id} value={child.Id || child.id}>
                  {child.Name || child.name}
                </option>
              ))}
            </select>

            <select
              value={testData.itemId}
              onChange={(e) => {
                const behavior = behaviorsData.find(b => (b.Id || b.id) === e.target.value);
                setTestData(prev => ({ 
                  ...prev, 
                  itemId: e.target.value,
                  points: behavior?.Points || behavior?.points || 0
                }));
              }}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="">เลือกพฤติกรรม</option>
              {behaviorsData.map(behavior => (
                <option key={behavior.Id || behavior.id} value={behavior.Id || behavior.id}>
                  {behavior.Name || behavior.name} ({behavior.Points || behavior.points} คะแนน)
                </option>
              ))}
            </select>

            <input
              type="number"
              value={testData.count}
              onChange={(e) => setTestData(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
              placeholder="จำนวนครั้ง"
              min="1"
              className="w-full p-2 border rounded text-sm"
            />

            <input
              type="text"
              value={testData.note}
              onChange={(e) => setTestData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="หมายเหตุ"
              className="w-full p-2 border rounded text-sm"
            />
          </div>

          <button
            onClick={testCreateActivity}
            disabled={isLoading || !testData.childId || !testData.itemId}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            ทดสอบบันทึกกิจกรรม
          </button>
        </div>

        {/* Test Results */}
        <div>
          <h3 className="font-semibold mb-2">ผลการทดสอบ</h3>
          {testResults.length === 0 ? (
            <p className="text-gray-500 text-sm">ยังไม่มีผลการทดสอบ</p>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {testResults.slice(-5).map((result, index) => (
                <div
                  key={`${result.test}-${result.timestamp}-${index}`}
                  className={`p-2 rounded text-sm ${
                    result.status === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  } border`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {result.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium">{result.test}</span>
                    <span className="text-xs text-gray-500 ml-auto">{result.timestamp}</span>
                  </div>
                  
                  {result.status === 'success' ? (
                    <div className="text-green-700 text-xs">
                      {typeof result.data === 'string' ? result.data : JSON.stringify(result.data).slice(0, 100)}
                    </div>
                  ) : (
                    <div className="text-red-700 text-xs">{result.error}</div>
                  )}

                  {result.payload && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs text-gray-600">Payload</summary>
                      <pre className="text-xs bg-gray-100 p-1 rounded mt-1 overflow-auto max-h-20">
                        {JSON.stringify(result.payload, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear Results */}
        {testResults.length > 0 && (
          <button
            onClick={() => setTestResults([])}
            className="w-full mt-2 bg-gray-500 text-white py-1 px-4 rounded hover:bg-gray-600 text-sm"
          >
            ล้างผลการทดสอบ
          </button>
        )}
      </div>

      {/* Current API Config */}
      <div className="bg-gray-50 p-3 border-t text-xs">
        <div className="font-semibold mb-1">API Config:</div>
        <div>URL: {api.health ? '✅' : '❌'} Available</div>
        <div>Children: {childrenData.length} loaded</div>
        <div>Behaviors: {behaviorsData.length} loaded</div>
      </div>
    </div>
  );
};

export default ActivityDebugComponent;