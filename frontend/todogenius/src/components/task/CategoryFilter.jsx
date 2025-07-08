import React, { useEffect, useState } from 'react'
import { ChevronDown, Tag } from 'lucide-react'
import { getCategories } from '../../services/api'

export default function CategoryFilter({ value, onChange }) {
  const [cats, setCats] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    getCategories().then((r) => setCats(r.data.data)).catch(() => {})
  }, [])

  // Category colors mapping
  const categoryColors = {
    'Work': { bg: 'bg-blue-500', text: 'text-white', lightBg: 'bg-blue-100', lightText: 'text-blue-700' },
    'Personal': { bg: 'bg-green-500', text: 'text-white', lightBg: 'bg-green-100', lightText: 'text-green-700' },
    'Shopping': { bg: 'bg-yellow-500', text: 'text-white', lightBg: 'bg-yellow-100', lightText: 'text-yellow-700' },
    'Health': { bg: 'bg-red-500', text: 'text-white', lightBg: 'bg-red-100', lightText: 'text-red-700' },
    'Finance': { bg: 'bg-purple-500', text: 'text-white', lightBg: 'bg-purple-100', lightText: 'text-purple-700' },
    'Education': { bg: 'bg-indigo-500', text: 'text-white', lightBg: 'bg-indigo-100', lightText: 'text-indigo-700' },
    'Travel': { bg: 'bg-cyan-500', text: 'text-white', lightBg: 'bg-cyan-100', lightText: 'text-cyan-700' },
    'Entertainment': { bg: 'bg-pink-500', text: 'text-white', lightBg: 'bg-pink-100', lightText: 'text-pink-700' },
    'Family': { bg: 'bg-orange-500', text: 'text-white', lightBg: 'bg-orange-100', lightText: 'text-orange-700' },
    'Hobbies': { bg: 'bg-teal-500', text: 'text-white', lightBg: 'bg-teal-100', lightText: 'text-teal-700' },
  }

  const getCategoryColors = (categoryName) => {
    return categoryColors[categoryName] || { bg: 'bg-gray-500', text: 'text-white', lightBg: 'bg-gray-100', lightText: 'text-gray-700' }
  }

  const getSelectedCategory = () => {
    if (!value) return null
    return cats.find(c => c.id === value)
  }

  const selectedCategory = getSelectedCategory()

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          {selectedCategory ? (
            <>
              <div className={`w-3 h-3 rounded-full ${getCategoryColors(selectedCategory.name).bg}`}></div>
              <span className="text-gray-700">{selectedCategory.name}</span>
            </>
          ) : (
            <>
              <Tag className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">All Categories</span>
            </>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
      </button>
      
      {showDropdown && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-auto">
          <button
            onClick={() => {
              onChange('')
              setShowDropdown(false)
            }}
            className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-200 ${
              !value ? 'bg-purple-50 border-l-4 border-purple-500' : ''
            }`}
          >
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">All Categories</span>
          </button>
          
          {cats.map((category) => {
            const colors = getCategoryColors(category.name)
            return (
              <button
                key={category.id}
                onClick={() => {
                  onChange(category.id)
                  setShowDropdown(false)
                }}
                className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-200 ${
                  value === category.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${colors.bg} flex items-center justify-center`}>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">{category.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
