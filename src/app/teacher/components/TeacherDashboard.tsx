'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type Classroom = Database['public']['Tables']['classrooms']['Row'] & {
  student_classrooms: Array<{
    student_id: string
    user_profiles: {
      id: string
      full_name: string | null
      email: string
    }
  }>
}
type Progress = Database['public']['Tables']['progress']['Row'] & {
  user_profiles: {
    full_name: string | null
    email: string
  }
  classrooms: {
    name: string
  }
}

interface TeacherDashboardProps {
  profile: UserProfile
  classrooms: Classroom[]
  progressRecords: Progress[]
}

export default function TeacherDashboard({ 
  profile, 
  classrooms, 
  progressRecords 
}: TeacherDashboardProps) {
  const [selectedClassroom, setSelectedClassroom] = useState<string>('')
  const [showAddProgress, setShowAddProgress] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [newProgress, setNewProgress] = useState({
    student_id: '',
    assignment_name: '',
    score: 0,
    notes: ''
  })

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedClassroom || !newProgress.student_id) return

    const selectedClass = classrooms.find(c => c.id === selectedClassroom)
    if (!selectedClass) return

    try {
      const { error } = await supabase
        .from('progress')
        .insert({
          student_id: newProgress.student_id,
          classroom_id: selectedClassroom,
          school_id: profile.school_id,
          assignment_name: newProgress.assignment_name,
          score: newProgress.score,
          notes: newProgress.notes || null
        })

      if (error) throw error

      // Reset form
      setNewProgress({
        student_id: '',
        assignment_name: '',
        score: 0,
        notes: ''
      })
      setShowAddProgress(false)
      
      // Refresh the page to show new data
      window.location.reload()
    } catch (error) {
      console.error('Error adding progress:', error)
      alert('Failed to add progress record')
    }
  }

  const handleCalculateAverages = async () => {
    setCalculating(true)
    try {
      const response = await fetch('/api/calculate-averages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classroom_id: selectedClassroom || null
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        alert(`Successfully calculated averages for ${result.data?.length || 0} classrooms`)
      } else {
        throw new Error(result.error || 'Failed to calculate averages')
      }
    } catch (error) {
      console.error('Error calculating averages:', error)
      alert('Failed to calculate class averages')
    } finally {
      setCalculating(false)
    }
  }

  const filteredProgress = selectedClassroom 
    ? progressRecords.filter(p => p.classroom_id === selectedClassroom)
    : progressRecords

  const selectedClassroomData = classrooms.find(c => c.id === selectedClassroom)
  const students = selectedClassroomData?.student_classrooms || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Welcome, {profile.full_name || profile.email}
        </h2>
        <p className="text-gray-600">
          Role: {profile.role.replace('_', ' ').toUpperCase()}
        </p>
      </div>

      {/* Classroom Selector */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Classroom</h3>
        <div className="flex space-x-4">
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            className="block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Classrooms</option>
            {classrooms.map(classroom => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name} ({classroom.subject || 'No Subject'})
              </option>
            ))}
          </select>
          <button
            onClick={handleCalculateAverages}
            disabled={calculating}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {calculating ? 'Calculating...' : 'Calculate Averages'}
          </button>
        </div>
      </div>

      {/* Add Progress Button */}
      {selectedClassroom && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Manage Progress</h3>
            <button
              onClick={() => setShowAddProgress(!showAddProgress)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {showAddProgress ? 'Cancel' : 'Add Progress'}
            </button>
          </div>

          {/* Add Progress Form */}
          {showAddProgress && (
            <form onSubmit={handleAddProgress} className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student</label>
                <select
                  value={newProgress.student_id}
                  onChange={(e) => setNewProgress(prev => ({ ...prev, student_id: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map(({ student_id, user_profiles }) => (
                    <option key={student_id} value={student_id}>
                      {user_profiles.full_name || user_profiles.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Assignment Name</label>
                <input
                  type="text"
                  value={newProgress.assignment_name}
                  onChange={(e) => setNewProgress(prev => ({ ...prev, assignment_name: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={newProgress.score}
                  onChange={(e) => setNewProgress(prev => ({ ...prev, score: parseFloat(e.target.value) }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea
                  value={newProgress.notes}
                  onChange={(e) => setNewProgress(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Add Progress Record
              </button>
            </form>
          )}
        </div>
      )}

      {/* Progress Records Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Progress Records
            {selectedClassroom && ` - ${selectedClassroomData?.name}`}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classroom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProgress.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.user_profiles.full_name || record.user_profiles.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.assignment_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.score >= 90 ? 'bg-green-100 text-green-800' :
                      record.score >= 80 ? 'bg-yellow-100 text-yellow-800' :
                      record.score >= 70 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.score}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.classrooms.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.date_submitted).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {record.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}