import React from 'react'
import TaskCard from './TaskCard'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import SuccessMessage from '../common/SuccessMessage'

export default function TaskList({
  tasks,
  loading,
  error,
  onToggle,
  onDelete,
  onEdit,
}) {
  if (loading) return <LoadingSpinner />
  if (error)
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    )
  if (!tasks.length)
    return <SuccessMessage message="No tasks found." />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((t) => (
        <TaskCard
          key={t.id}
          task={t}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}
