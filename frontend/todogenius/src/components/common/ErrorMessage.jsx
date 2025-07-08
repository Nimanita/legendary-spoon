import React from 'react'

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded">
      <p>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-sm text-red-700 underline"
        >
          Retry
        </button>
      )}
    </div>
  )
}
