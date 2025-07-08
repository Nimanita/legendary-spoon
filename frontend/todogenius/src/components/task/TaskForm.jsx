// src/components/task/TaskForm.jsx

// src/components/task/TaskForm.jsx

import React, { useState, useEffect, useRef } from 'react'
import { Brain, Sparkles, Calendar, Tag, Target, CheckCircle, X, ArrowRight, Lightbulb, Clock, Star } from 'lucide-react'
import useDebounce from '../../hooks/useDebounce'
import {
  createTask,
  updateTask,
  enhanceTask,
  getCategories,
} from '../../services/api'
import PriorityIndicator from './PriorityIndicator'
import LoadingSpinner from '../common/LoadingSpinner'

export default function TaskForm({ task, onSuccess, onCancel }) {
  const isEditing = Boolean(task?.id)
  
  // Form fields
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [category, setCategory] = useState(task?.category?.name || '')
  const [color, setColor] = useState(task?.category?.color || '#A78BFA')
  const [priority, setPriority] = useState(task?.priority_score || 0.5)
  const [deadline, setDeadline] = useState(task?.deadline?.slice(0, 10) || '')

  // Track original values for AI enhancement
  const [originalTitle, setOriginalTitle] = useState(task?.title || '')

  // AI state
  const [aiData, setAiData] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [showAiSuggestions, setShowAiSuggestions] = useState(false)

  // Categories
  const [allCats, setAllCats] = useState([])
  const [catOpen, setCatOpen] = useState(false)

  // Saving
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // Refs
  const descRef = useRef()
  const catInputRef = useRef()
  const priorityRef = useRef()
  const deadlineRef = useRef()

  // Debounce title for AI suggestions (both create and edit)
  const debouncedTitle = useDebounce(title, 3000) // Reduced to 3 seconds for better UX

  // Set original title when task changes
  useEffect(() => {
    if (task?.title) {
      setOriginalTitle(task.title)
    }
  }, [task?.title])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories()
        setAllCats(response.data.data || [])
      } catch (error) {
        console.error('Failed to load categories:', error)
        setAllCats([])
      }
    }
    loadCategories()
  }, [])

  // Fetch AI suggestions when title changes (for both create and edit)
  useEffect(() => {
    // Only trigger AI if:
    // 1. Title exists and is not empty
    // 2. Title has changed from original (for edit) or is new (for create)
    // 3. Title is different from what we already have AI data for
    if (!debouncedTitle.trim()) return
    
    const shouldFetchAI = isEditing 
      ? debouncedTitle !== originalTitle && debouncedTitle !== (aiData?.original_title || '')
      : debouncedTitle !== (aiData?.original_title || '')

    if (!shouldFetchAI) return

    const fetchAiSuggestions = async () => {
      setAiLoading(true)
      setErrors({})
      
      try {
        const response = await enhanceTask(debouncedTitle)
        if (response.data.success) {
          const aiResponse = response.data.data
          // Store original title with AI data for comparison
          setAiData({ ...aiResponse, original_title: debouncedTitle })
          setShowAiSuggestions(true)
        }
      } catch (error) {
        console.error('AI enhancement failed:', error)
        setErrors({ ai: 'Failed to get AI suggestions. Please try again.' })
      } finally {
        setAiLoading(false)
      }
    }

    fetchAiSuggestions()
  }, [debouncedTitle, originalTitle, isEditing, aiData?.original_title])

  // Get text color based on background
  const getTextColor = (bgColor) => {
    const hex = bgColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#FFFFFF'
  }

  // Get priority info
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

  // Prepare AI suggestions
  const suggested = aiData ? {
    description: Array.isArray(aiData.descriptions) 
      ? aiData.descriptions[0] 
      : aiData.descriptions || '',
    deadline: aiData.deadline ? aiData.deadline.slice(0, 10) : '',
    category: aiData.category?.name || '',
    color: aiData.category?.color || '#A78BFA',
    priority: aiData.priority_score ?? priority,
  } : {}

  // Apply AI suggestion
  const applySuggestion = (field) => {
    if (!aiData) return
    
    switch (field) {
      case 'description':
        setDescription(suggested.description)
        break
      case 'category':
        setCategory(suggested.category)
        setColor(suggested.color)
        break
      case 'priority':
        setPriority(suggested.priority)
        break
      case 'deadline':
        setDeadline(suggested.deadline)
        break
      case 'all':
        setDescription(suggested.description)
        setCategory(suggested.category)
        setColor(suggested.color)
        setPriority(suggested.priority)
        setDeadline(suggested.deadline)
        break
    }
    
    // Add a subtle animation effect
    const element = document.querySelector(`[data-field="${field}"]`)
    if (element) {
      element.classList.add('animate-pulse')
      setTimeout(() => element.classList.remove('animate-pulse'), 1000)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category_name: category,
        category_color: color,
        priority_score: priority,
        deadline: deadline || null,
        is_ai_enhanced: !!aiData,
        is_ai_suggested_deadline: !!aiData && suggested.deadline,
      }

      if (isEditing) {
        await updateTask(task.id, payload)
      } else {
        await createTask(payload)
      }
      
      onSuccess()
    } catch (error) {
      console.error('Save failed:', error)
      setErrors({ 
        submit: error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} task. Please try again.` 
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 space-y-8 border border-purple-100">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <p className="text-gray-600">
            {isEditing ? 'Update your task with AI-powered suggestions' : 'Let AI help you organize your tasks intelligently'}
          </p>
          {isEditing && (
            <div className="mt-2 inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              <Target className="h-4 w-4" />
              <span>Task ID: {task.id}</span>
            </div>
          )}
        </div>

        {/* AI Suggestions Panel */}
        {showAiSuggestions && aiData && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">
                  {isEditing ? 'AI Suggestions for Updates' : 'AI Suggestions'}
                </h3>
                <div className="px-2 py-1 bg-purple-100 rounded-full">
                  <span className="text-xs font-medium text-purple-700">
                    {Math.round(aiData.confidence * 100)}% confident
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiSuggestions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {aiData.reasoning && (
              <div className="bg-white/60 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 leading-relaxed">{aiData.reasoning}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Description</span>
                  <button
                    type="button"
                    onClick={() => applySuggestion('description')}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-sm text-gray-600 bg-white/80 rounded-lg p-3 line-clamp-3">
                  {suggested.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Category</span>
                  <button
                    type="button"
                    onClick={() => applySuggestion('category')}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Apply
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: suggested.color }}
                  />
                  <span 
                    className="text-sm font-medium px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: suggested.color + '20',
                      color: getTextColor(suggested.color) === '#FFFFFF' ? suggested.color : getTextColor(suggested.color)
                    }}
                  >
                    {suggested.category}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Priority</span>
                  <button
                    type="button"
                    onClick={() => applySuggestion('priority')}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Apply
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <PriorityIndicator score={suggested.priority} />
                  <span className="text-sm text-gray-600">
                    {getPriorityInfo(suggested.priority).label} ({suggested.priority.toFixed(1)})
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Deadline</span>
                  <button
                    type="button"
                    onClick={() => applySuggestion('deadline')}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Apply
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {suggested.deadline ? new Date(suggested.deadline).toLocaleDateString() : 'No deadline'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => applySuggestion('all')}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Apply All Suggestions</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-8">
          {/* Title */}
          <div className="space-y-2" data-field="title">
            <label className="block text-sm font-medium text-gray-700">
              <Target className="inline h-4 w-4 mr-2" />
              Task Title
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
                placeholder="What needs to be done?"
                required
              />
              {aiLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="4" />
                    <span className="text-sm text-purple-600">AI thinking...</span>
                  </div>
                </div>
              )}
            </div>
            {errors.ai && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <X className="h-4 w-4" />
                <span>{errors.ai}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2" data-field="description">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              ref={descRef}
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Add more details about your task..."
            />
          </div>

          {/* Category */}
          <div className="space-y-2" data-field="category">
            <label className="block text-sm font-medium text-gray-700">
              <Tag className="inline h-4 w-4 mr-2" />
              Category
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCatOpen(!catOpen)}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 flex items-center justify-between hover:bg-white/90"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span 
                    className="text-sm font-medium px-3 py-1 rounded-full"
                    style={{ 
                      backgroundColor: color + '20',
                      color: getTextColor(color) === '#FFFFFF' ? color : getTextColor(color)
                    }}
                  >
                    {category || 'Select category'}
                  </span>
                </div>
                <ArrowRight className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${catOpen ? 'rotate-90' : ''}`} />
              </button>

              {catOpen && (
                <div className="absolute z-10 mt-2 w-full bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-auto">
                  {aiData && suggested.category && (
                    <button
                      type="button"
                      onClick={() => {
                        setCategory(suggested.category)
                        setColor(suggested.color)
                        setCatOpen(false)
                      }}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-purple-50 transition-colors duration-200 border-b border-gray-100"
                    >
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: suggested.color }}
                      />
                      <span 
                        className="text-sm font-medium px-3 py-1 rounded-full"
                        style={{ 
                          backgroundColor: suggested.color + '20',
                          color: getTextColor(suggested.color) === '#FFFFFF' ? suggested.color : getTextColor(suggested.color)
                        }}
                      >
                        AI: {suggested.category}
                      </span>
                      <Sparkles className="h-4 w-4 text-purple-500 ml-auto" />
                    </button>
                  )}

                  {allCats.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.name)
                        setColor(cat.color)
                        setCatOpen(false)
                      }}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span 
                        className="text-sm font-medium px-3 py-1 rounded-full"
                        style={{ 
                          backgroundColor: cat.color + '20',
                          color: getTextColor(cat.color) === '#FFFFFF' ? cat.color : getTextColor(cat.color)
                        }}
                      >
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Priority and Deadline Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div className="space-y-2" data-field="priority">
              <label className="block text-sm font-medium text-gray-700">
                <Star className="inline h-4 w-4 mr-2" />
                Priority: <span className="font-bold text-purple-600">{priority.toFixed(1)}</span>
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <input
                    ref={priorityRef}
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={priority}
                    onChange={(e) => setPriority(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${getPriorityInfo(priority).color.replace('from-', '').replace('to-', '').replace(' ', ', ')} 0%, ${getPriorityInfo(priority).color.replace('from-', '').replace('to-', '').replace(' ', ', ')} ${priority * 100}%, #e5e7eb ${priority * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <PriorityIndicator score={priority} />
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityInfo(priority).bgColor} ${getPriorityInfo(priority).textColor}`}>
                    {getPriorityInfo(priority).label}
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${getPriorityInfo(priority).color} transition-all duration-300`}
                      style={{ width: `${priority * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-2" data-field="deadline">
              <label className="block text-sm font-medium text-gray-700">
                <Clock className="inline h-4 w-4 mr-2" />
                Deadline
              </label>
              <input
                ref={deadlineRef}
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                min={new Date().toISOString().split('T')[0]}
              />
              {deadline && (
                <div className="text-sm text-gray-600 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {new Date(deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700">{errors.submit}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <LoadingSpinner size="4" />
                <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>{isEditing ? 'Update Task' : 'Create Task'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}