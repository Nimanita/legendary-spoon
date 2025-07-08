import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import TaskManagement from './pages/TaskManagement'
import ContextPage from './pages/ContextPage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
       
        <main className="p-4 overflow-auto">
          <Routes>
            <Route path="/" element={<TaskManagement />} />
            <Route path="/context" element={<ContextPage />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}


