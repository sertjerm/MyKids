// src/components/admin/ActivitiesHistory.jsx
import React, { useState } from 'react'
import { Calendar, Filter, Download, TrendingUp, User, Clock } from 'lucide-react'
import { useData } from '../../hooks/useData'
import Card from '../common/Card'
import Button from '../common/Button'
import {Avatar} from 'antd'
import LoadingSpinner from '../common/LoadingSpinner'

function ActivitiesHistory() {
  const { data, loading } = useData()
  const [selectedChild, setSelectedChild] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  const filteredActivities = data.activities?.filter(activity => {
    let matches = true
    
    if (selectedChild !== 'all') {
      matches = matches && activity.ChildId === selectedChild
    }
    
    if (selectedDate) {
      matches = matches && activity.ActivityDate === selectedDate
    }
    
    if (selectedType !== 'all') {
      matches = matches && activity.ActivityType === selectedType
    }
    
    return matches
  }) || []

  const totalPoints = filteredActivities.reduce((sum, activity) => 
    sum + (activity.EarnedPoints || 0), 0
  )

  const positivePoints = filteredActivities
    .filter(a => a.EarnedPoints > 0)
    .reduce((sum, activity) => sum + activity.EarnedPoints, 0)

  const negativePoints = filteredActivities
    .filter(a => a.EarnedPoints < 0)
    .reduce((sum, activity) => sum + activity.EarnedPoints, 0)

  if (loading) {
    return <LoadingSpinner text="กำลังโหลดประวัติกิจกรรม..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-thai">ประวัติกิจกรรม</h2>
          <p className="text-gray-600 font-thai">ดูและวิเคราะห์กิจกรรมของเด็กทั้งหมด</p>
        </div>
        <Button
          variant="secondary"
          icon={Download}
        >
          ส่งออกข้อมูล
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 font-thai flex items-center gap-2">
          <Filter className="w-5 h-5" />
          ตัวกรอง
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-thai">
              เด็ก
            </label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-thai"
            >
              <option value="all">ทั้งหมด</option>
              {data.children?.map(child => (
                <option key={child.Id} value={child.Id}>{child.Name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-thai">
              วันที่
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-thai"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-thai">
              ประเภท
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-thai"
            >
              <option value="all">ทั้งหมด</option>
              <option value="Good">พฤติกรรมดี</option>
              <option value="Bad">พฤติกรรมไม่ดี</option>
              <option value="Reward">รางวัล</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card hover className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-thai">กิจกรรมทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-800">{filteredActivities.length}</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card hover className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-thai">คะแนนรวม</p>
              <p className={`text-3xl font-bold ${totalPoints >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPoints >= 0 ? '+' : ''}{totalPoints}
              </p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card hover className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-thai">คะแนนบวก</p>
              <p className="text-3xl font-bold text-green-600">+{positivePoints}</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card hover className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-thai">คะแนนลบ</p>
              <p className="text-3xl font-bold text-red-600">{negativePoints}</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Activities List */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 font-thai">
          รายการกิจกรรม ({filteredActivities.length} รายการ)
        </h3>

        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2 font-thai">
              ไม่พบกิจกรรม
            </h4>
            <p className="text-gray-500 font-thai">
              ลองเปลี่ยนตัวกรองหรือเพิ่มกิจกรรมใหม่
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <ActivityRow key={activity.Id} activity={activity} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function ActivityRow({ activity }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'Good':
        return '😊'
      case 'Bad':
        return '😔'
      case 'Reward':
        return '🎁'
      default:
        return '📝'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Good':
        return 'text-green-600 bg-green-50'
      case 'Bad':
        return 'text-red-600 bg-red-50'
      case 'Reward':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: activity.ItemColor }}
        ></div>
        <span className="text-2xl">{getTypeIcon(activity.ActivityType)}</span>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-800 font-thai">{activity.ItemName}</h4>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(activity.ActivityType)}`}>
            {activity.ActivityType === 'Good' ? 'ดี' : activity.ActivityType === 'Bad' ? 'ไม่ดี' : 'รางวัล'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span className="font-thai">{activity.ChildName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(activity.ActivityDate).toLocaleDateString('th-TH')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{new Date(activity.CreatedAt).toLocaleTimeString('th-TH', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</span>
          </div>
        </div>
        {activity.Note && (
          <p className="text-sm text-gray-500 mt-1 font-thai">{activity.Note}</p>
        )}
      </div>

      <div className={`text-right ${activity.EarnedPoints >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        <p className="text-xl font-bold">
          {activity.EarnedPoints >= 0 ? '+' : ''}{activity.EarnedPoints}
        </p>
        <p className="text-xs text-gray-500 font-thai">คะแนน</p>
      </div>
    </div>
  )
}

export default ActivitiesHistory



