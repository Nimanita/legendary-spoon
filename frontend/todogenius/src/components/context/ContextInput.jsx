import React, { useState } from 'react'
import { Plus, Calendar, Tag, Brain, CheckCircle, X, Sparkles } from 'lucide-react'
import { SOURCE_TYPES } from '../../utils/constants'
import { createContext } from '../../services/api'
import SuccessMessage from '../common/SuccessMessage'
import LoadingSpinner from '../common/LoadingSpinner'

export default function ContextInput({ onSuccess }) {
  const [content, setContent] = useState('')
  const [source, setSource] = useState(SOURCE_TYPES[0])
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await createContext({ 
        content: content.trim(), 
        source_type: source, 
        context_date: date 
      })
      
      setContent('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Failed to create context:', err)
      setError(err.response?.data?.message || 'Failed to add context. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Get source type colors
  const getSourceColor = (sourceType) => {
    const colors = {
      'meeting': 'from-blue-500 to-cyan-500',
      'email': 'from-green-500 to-emerald-500',
      'document': 'from-purple-500 to-violet-500',
      'conversation': 'from-orange-500 to-red-500',
      'note': 'from-yellow-500 to-amber-500',
      'research': 'from-indigo-500 to-purple-500',
      'default': 'from-gray-500 to-gray-600'
    }
    return colors[sourceType] || colors['default']
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-purple-100">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
          <Plus className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Add Context</h2>
          <p className="text-gray-600">Share information to improve AI task suggestions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Brain className="inline h-4 w-4 mr-2" />
            Context Information
          </label>
          <textarea
            required
            rows="4"
            className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Share relevant information like meeting notes, project details, deadlines, preferences, or any context that could help AI suggest better tasks..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Help AI understand your work context better</span>
            <span>{content.length}/1000</span>
          </div>
        </div>

        {/* Source and Date Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Tag className="inline h-4 w-4 mr-2" />
              Source Type
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              disabled={loading}
            >
              {SOURCE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getSourceColor(source)}`} />
              <span className="text-sm text-gray-600 capitalize">{source}</span>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Calendar className="inline h-4 w-4 mr-2" />
              Context Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              disabled={loading}
            />
            <div className="flex items-center space-x-2 mt-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date(date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-sm text-emerald-700">Context added successfully!</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner size="4" />
                <span>Adding Context...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Add Context</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Section */}
      <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
        <div className="flex items-start space-x-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-purple-800 mb-1">How Context Helps</h4>
            <p className="text-sm text-purple-700 leading-relaxed">
              The more context you provide, the better AI can understand your work patterns, priorities, and preferences. 
              This leads to more accurate task suggestions, better categorization, and smarter deadline recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}