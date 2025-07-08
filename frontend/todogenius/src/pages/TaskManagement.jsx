import React, { useState } from 'react'
import { Plus, Sparkles, Brain, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useTasks from '../hooks/useTasks'
import TaskFilter from '../components/task/TaskFilter'
import TaskList from '../components/task/TaskList'
import TaskForm from '../components/task/TaskForm'

export default function TaskManagement() {
  const { tasks, loading, error, filters, setFilters, reload } = useTasks()
  const [editing, setEditing] = useState(null)
  const navigate = useNavigate()

  const handleEdit = (task) => {
    setEditing(task)
  }

  const handleDelete = async (id) => {
    await reload()
  }

  const handleToggle = async () => {
    await reload()
  }

  const closeForm = () => {
    setEditing(null)
    reload()
  }

  const handleContextClick = () => {
    navigate('/context')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  TodoGenius
                </h1>
                <p className="text-sm text-gray-600">Intelligent Task Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleContextClick}
                className="group relative inline-flex items-center px-4 py-2 overflow-hidden text-sm font-medium text-purple-600 bg-white/80 border border-purple-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <MessageCircle className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                <span>Context</span>
              </button>
              <div className="px-3 py-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full">
                <span className="text-sm font-medium text-white">
                  {tasks.filter(t => t.status === 'completed').length}/{tasks.length} Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {editing ? (
          <div className="mb-8">
            <TaskForm
              task={editing}
              onSuccess={closeForm}
              onCancel={() => setEditing(null)}
            />
          </div>
        ) : (
          <>
            {/* Filter Section */}
            <div className="mb-8">
              <TaskFilter filters={filters} onChange={setFilters} />
            </div>

            {/* New Task Button */}
            <div className="mb-8">
              <button
                onClick={() => setEditing({})}
                className="group relative inline-flex items-center px-6 py-3 overflow-hidden text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span className="absolute left-0 block w-full h-0 transition-all bg-white opacity-10 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
                <span className="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                  <Plus className="w-5 h-5" />
                </span>
                <span className="relative">Create New Task</span>
                <Sparkles className="w-5 h-5 ml-2 group-hover:animate-pulse" />
              </button>
            </div>

            {/* Task List */}
            <TaskList
              tasks={tasks}
              loading={loading}
              error={error}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </>
        )}
      </div>
    </div>
  )
}