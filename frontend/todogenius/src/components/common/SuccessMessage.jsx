import React from 'react'

export default function SuccessMessage({ message }) {
  return (
    <div className="bg-green-100 border border-green-300 text-green-700 p-3 rounded">
      {message}
    </div>
  )
}
