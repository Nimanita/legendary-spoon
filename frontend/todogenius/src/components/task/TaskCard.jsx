import React, { useState } from 'react'
import { 
  Calendar, 
  Tag, 
  Star, 
  CheckCircle, 
  Edit3, 
  Trash2, 
  Clock, 
  Sparkles,
  X,
  AlertTriangle,
  Target,
  Brain
} from 'lucide-react'
import { formatDate } from '../../utils/taskUtils'
import PriorityIndicator from './PriorityIndicator'
import TaskForm from './TaskForm'

export default function TaskCard({
  task,
  onToggle,
  onDelete,
  onEdit,
}) {
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Get text color based on background
  const getTextColor = (bgColor) => {
    const hex = bgColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#FFFFFF'
  }

  // Handle task completion toggle
  const handleToggleComplete = async () => {
    setIsProcessing(true)
    try {
      await onToggle(task.id, {
        ...task,
        status: task.status === 'completed' ? 'pending' : 'completed',
      })
      setShowCompleteModal(false)
    } catch (error) {
      console.error('Failed to toggle task:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle task deletion
  const handleDelete = async () => {
    setIsProcessing(true)
    try {
      await onDelete(task.id)
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle edit form success
  const handleEditSuccess = () => {
    setShowEditForm(false)
    if (onEdit) {
      onEdit(task)
    }
  }

  // Get priority color and label
  const getPriorityInfo = (score) => {
    if (score > 0.7) return { 
      color: 'from-red-500 to-red-600', 
      label: 'High',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700'
    }
    if (score >= 0.3) return { 
      color: 'from-blue-500 to-blue-600', 
      label: 'Medium',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700'
    }
    return { 
      color: 'from-yellow-500 to-yellow-600', 
      label: 'Low',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700'
    }
  }

  // Check if task is overdue
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed'

  // Check if task is due soon (within 3 days)
  const isDueSoon = task.deadline && 
    new Date(task.deadline) > new Date() && 
    new Date(task.deadline) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) &&
    task.status !== 'completed'

  if (showEditForm) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <TaskForm
            task={task}
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditForm(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-purple-200 transform hover:scale-105 ${
        task.status === 'completed' ? 'opacity-75' : ''
      }`}>
        {/* Priority indicator ribbon */}
        <div className={`absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-gradient-to-r ${getPriorityInfo(task.priority_score).color} rounded-tr-2xl`}>
          <div className="absolute -top-8 -right-1 text-white">
            <Star className="h-3 w-3" />
          </div>
        </div>

        {/* AI Enhanced Badge */}
        {task.is_ai_enhanced && (
          <div className="absolute top-3 left-3 flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            <Brain className="h-3 w-3" />
            <span>AI</span>
          </div>
        )}

        {/* Status indicator */}
        {task.status === 'completed' && (
          <div className="absolute top-3 right-14 bg-gradient-to-r from-emerald-400 to-cyan-400 text-white p-1 rounded-full">
            <CheckCircle className="h-4 w-4" />
          </div>
        )}

        {/* Overdue/Due Soon indicators */}
        {isOverdue && (
          <div className="absolute top-3 right-14 bg-gradient-to-r from-red-500 to-red-600 text-white p-1 rounded-full animate-pulse">
            <AlertTriangle className="h-4 w-4" />
          </div>
        )}
        {isDueSoon && !isOverdue && (
          <div className="absolute top-3 right-14 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-1 rounded-full">
            <Clock className="h-4 w-4" />
          </div>
        )}

        {/* Main content */}
        <div className="space-y-4 mt-6">
          {/* Title */}
          <div className="flex items-start justify-between">
            <h3 className={`font-bold text-lg leading-tight ${
              task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'
            }`}>
              {task.title}
            </h3>
            <div className="flex items-center ml-4">
              <PriorityIndicator score={task.priority_score} />
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className={`text-sm leading-relaxed ${
              task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
            } line-clamp-3`}>
              {task.description}
            </p>
          )}

          {/* Category */}
          {task.category && (
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <div className="flex items-center space-x-2">
               
                <span 
                  className="text-sm font-medium px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: task.category_color + '20',
                    color: getTextColor(task.category_color) === '#FFFFFF' ? task.category_color : getTextColor(task.category_color)
                  }}
                >
                  {task.category_name}
                </span>
              </div>
            </div>
          )}

          {/* Deadline */}
          {task.deadline && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className={`text-sm font-medium ${
                isOverdue ? 'text-red-600' : 
                isDueSoon ? 'text-orange-600' : 
                'text-gray-700'
              }`}>
                {formatDate(task.deadline)}
              </span>
              {task.is_ai_suggested_deadline && (
                <div className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                  <Brain className="h-3 w-3" />
                  <span>AI</span>
                </div>
              )}
            </div>
          )}

          {/* Priority Score */}
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-gray-400" />
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityInfo(task.priority_score).bgColor} ${getPriorityInfo(task.priority_score).textColor}`}>
                {getPriorityInfo(task.priority_score).label}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {task.priority_score.toFixed(1)}
              </span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getPriorityInfo(task.priority_score).color} transition-all duration-300`}
                  style={{ width: `${task.priority_score * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {/* Complete/Uncomplete button */}
            <button
              onClick={() => setShowCompleteModal(true)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                task.status === 'completed'
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              <span>{task.status === 'completed' ? 'Reopen' : 'Complete'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Edit button */}
            <button
              onClick={() => setShowEditForm(true)}
              className="flex items-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all duration-200 text-sm font-medium"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit</span>
            </button>

            {/* Delete button */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-medium"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Hover effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 max-w-md w-full border border-red-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Delete Task</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">
                Are you sure you want to delete "<span className="font-medium">{task.title}</span>"?
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium flex items-center space-x-2 disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Confirmation Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 max-w-md w-full border border-purple-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-full ${
                task.status === 'completed' ? 'bg-orange-100' : 'bg-emerald-100'
              }`}>
                <CheckCircle className={`h-6 w-6 ${
                  task.status === 'completed' ? 'text-orange-600' : 'text-emerald-600'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {task.status === 'completed' ? 'Reopen Task' : 'Complete Task'}
                </h3>
                <p className="text-sm text-gray-600">
                  {task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                </p>
              </div>
            </div>
            
            <div className={`rounded-lg p-4 mb-6 ${
              task.status === 'completed' ? 'bg-orange-50' : 'bg-emerald-50'
            }`}>
              <p className={`text-sm ${
                task.status === 'completed' ? 'text-orange-700' : 'text-emerald-700'
              }`}>
                {task.status === 'completed' 
                  ? `Reopen "${task.title}" and mark it as pending?`
                  : `Mark "${task.title}" as completed?`
                }
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleToggleComplete}
                className={`px-4 py-2 text-white rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 ${
                  task.status === 'completed' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                }`}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>{task.status === 'completed' ? 'Reopen' : 'Complete'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}