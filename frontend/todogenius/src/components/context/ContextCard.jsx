import React, { useState } from 'react'
import { 
  Calendar, 
  Tag, 
  Brain, 
  CheckCircle, 
  Clock, 
  Sparkles,
  Edit3,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react'

export default function ContextCard({ entry, onEdit, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Get source type colors and icons
  const getSourceInfo = (sourceType) => {
    const sourceMap = {
      'whatsapp': { 
        color: 'from-blue-500 to-cyan-500', 
        bgColor: 'bg-blue-50', 
        textColor: 'text-blue-700',
        icon: '👥'
      },
      'email': { 
        color: 'from-green-500 to-emerald-500', 
        bgColor: 'bg-green-50', 
        textColor: 'text-green-700',
        icon: '📧'
      },
      'other': { 
        color: 'from-purple-500 to-violet-500', 
        bgColor: 'bg-purple-50', 
        textColor: 'text-purple-700',
        icon: '📄'
      },
      'note': { 
        color: 'from-yellow-500 to-amber-500', 
        bgColor: 'bg-yellow-50', 
        textColor: 'text-yellow-700',
        icon: '📝'
      }
    }
    return sourceMap[sourceType] || sourceMap['default']
  }

  const sourceInfo = getSourceInfo(entry.source_type)

  // Handle deletion
  const handleDelete = async () => {
    if (!onDelete) return
    
    setIsProcessing(true)
    try {
      await onDelete(entry.id)
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Failed to delete context:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now - date
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-purple-200 transform hover:scale-105">
        {/* Processing Status Badge */}
        <div className="absolute top-4 right-4">
          {entry.is_processed ? (
            <div className="flex items-center space-x-1 bg-gradient-to-r from-emerald-400 to-cyan-400 text-white px-3 py-1 rounded-full text-xs font-medium">
              <CheckCircle className="h-3 w-3" />
              <span>Processed</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
              <Clock className="h-3 w-3" />
              <span>Pending</span>
            </div>
          )}
        </div>

        {/* Source Type Badge */}
        <div className="absolute top-4 left-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${sourceInfo.bgColor} ${sourceInfo.textColor}`}>
            <span>{sourceInfo.icon}</span>
            <span className="capitalize">{entry.source_type}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4 mt-12">
          {/* Content */}
          <div className="space-y-2">
            <p className="text-gray-800 leading-relaxed line-clamp-4">
              {entry.content}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              {/* Date */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 font-medium">
                  {formatDate(entry.context_date)}
                </span>
              </div>

              {/* Source Indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${sourceInfo.color}`} />
                <span className="text-sm text-gray-600 capitalize">
                  {entry.source_type}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {onEdit && (
                <button
                  onClick={() => onEdit(entry)}
                  className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                  title="Edit context"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  title="Delete context"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hover Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Processing Indicator */}
        {entry.is_processed && (
          <div className="absolute bottom-2 right-2 text-emerald-500">
            <Brain className="h-4 w-4" />
          </div>
        )}
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
                <h3 className="text-lg font-semibold text-gray-800">Delete Context</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 line-clamp-3">
                Are you sure you want to delete this context entry? This will remove: 
                <span className="font-medium block mt-1">"{entry.content}"</span>
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
    </>
  )
}
