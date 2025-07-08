import React, { useState, useEffect } from 'react'
import { Search, Filter, X, ChevronDown, CheckCircle, Clock, AlertCircle, Star, Tag, Calendar } from 'lucide-react'
import useDebounce from '../../hooks/useDebounce'
import { STATUS_OPTIONS } from '../../utils/constants'
import CategoryFilter from './CategoryFilter'

export default function TaskFilter({ filters, onChange }) {
  const [search, setSearch] = useState(filters.search || '')
  const [showFilters, setShowFilters] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    onChange({ ...filters, search: debouncedSearch })
  }, [debouncedSearch])

  const priorityOptions = [
    { value: 'all', label: 'All Priority', icon: Star, color: 'text-gray-500' },
    { value: 'high', label: 'High (>0.7)', icon: Star, color: 'text-red-500' },
    { value: 'medium', label: 'Medium (0.3-0.7)', icon: Star, color: 'text-blue-500' },
    { value: 'low', label: 'Low (<0.3)', icon: Star, color: 'text-yellow-500' },
  ]

  const statusOptions = [
    { value: 'all', label: 'All Tasks', icon: Filter, color: 'text-gray-500' },
    { value: 'pending', label: 'Pending', icon: Clock, color: 'text-orange-500' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-green-500' },
    { value: 'overdue', label: 'Overdue', icon: AlertCircle, color: 'text-red-500' },
  ]

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.status && filters.status !== 'all') count++
    if (filters.priority && filters.priority !== 'all') count++
    if (filters.category && filters.category !== '') count++
    return count
  }

  const clearFilters = () => {
    onChange({
      search: '',
      status: 'all',
      priority: 'all',
      category: '',
    })
    setSearch('')
  }

  const getStatusLabel = (value) => {
    const option = statusOptions.find(opt => opt.value === value)
    return option ? option.label : 'All Tasks'
  }

  const getPriorityLabel = (value) => {
    const option = priorityOptions.find(opt => opt.value === value)
    return option ? option.label : 'All Priority'
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100 mb-8" style={{ zIndex: 1, position: 'relative' }}>
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-xl hover:from-purple-200 hover:to-blue-200 transition-all duration-200 font-medium"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getActiveFilterCount()}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-200 font-medium"
          >
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <CheckCircle className="inline h-4 w-4 mr-2" />
              Status
            </label>
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 flex items-center justify-between"
              >
                <span className="text-gray-700">{getStatusLabel(filters.status || 'all')}</span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showStatusDropdown && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-auto">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onChange({ ...filters, status: option.value })
                        setShowStatusDropdown(false)
                      }}
                      className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-200 ${
                        (filters.status || 'all') === option.value ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                      }`}
                    >
                      <option.icon className={`h-4 w-4 ${option.color}`} />
                      <span className="text-gray-700">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Star className="inline h-4 w-4 mr-2" />
              Priority
            </label>
            <div className="relative">
              <button
                onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 flex items-center justify-between"
              >
                <span className="text-gray-700">{getPriorityLabel(filters.priority || 'all')}</span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showPriorityDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showPriorityDropdown && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-auto">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onChange({ ...filters, priority: option.value })
                        setShowPriorityDropdown(false)
                      }}
                      className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-200 ${
                        (filters.priority || 'all') === option.value ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                      }`}
                    >
                      <option.icon className={`h-4 w-4 ${option.color}`} />
                      <span className="text-gray-700">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Tag className="inline h-4 w-4 mr-2" />
              Category
            </label>
            <CategoryFilter
              value={filters.category || ''}
              onChange={(val) => onChange({ ...filters, category: val })}
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600">Active filters:</span>
            
            {filters.status && filters.status !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                Status: {getStatusLabel(filters.status)}
                <button
                  onClick={() => onChange({ ...filters, status: 'all' })}
                  className="ml-2 text-purple-500 hover:text-purple-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.priority && filters.priority !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Priority: {getPriorityLabel(filters.priority)}
                <button
                  onClick={() => onChange({ ...filters, priority: 'all' })}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.category && filters.category !== '' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Category: {filters.category}
                <button
                  onClick={() => onChange({ ...filters, category: '' })}
                  className="ml-2 text-green-500 hover:text-green-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}