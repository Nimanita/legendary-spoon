import React from 'react'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import ContextCard from './ContextCard'

export default function ContextHistory({
  entries,
  loading,
  error,
}) {
  if (loading) return <LoadingSpinner />
  if (error)
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    )
  if (!entries.length)
    return <p className="text-gray-600">No context entries.</p>

  return (
    <div className="space-y-2">
      {entries.map((e) => (
        <ContextCard key={e.id} entry={e} />
      ))}
    </div>
  )
}
