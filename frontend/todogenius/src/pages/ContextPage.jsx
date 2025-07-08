import React from 'react'
import { Brain, BookOpen, Sparkles } from 'lucide-react'
import useContextEntries from '../hooks/useContext'
import ContextInput from '../components/context/ContextInput'
import ContextHistory from '../components/context/ContextHistory'

export default function ContextPage() {
  const { entries, loading, error, reload } = useContextEntries()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4 shadow-lg">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Context Intelligence
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Feed your AI assistant with context to get more personalized and intelligent task suggestions
          </p>
          <div className="flex items-center justify-center space-x-6 mt-6">
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">
                {entries?.length || 0} Entries
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                AI-Powered
              </span>
            </div>
          </div>
        </div>

        {/* Context Input */}
        <ContextInput onSuccess={reload} />

        {/* Context History */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-purple-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Context History</h2>
              <p className="text-gray-600">Your personal knowledge base for AI enhancement</p>
            </div>
          </div>
          
          <ContextHistory
            entries={entries}
            loading={loading}
            error={error}
            onRetry={reload}
          />
        </div>
      </div>
    </div>
  )
}

