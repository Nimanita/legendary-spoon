import React from 'react'

export default function LoadingSpinner({ size = '6' }) {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 h-${size} w-${size}`}
      ></div>
    </div>
  )
}
