import React from 'react'

export default function AIEnhancementModal({
  isOpen,
  enhancedData,
  onAccept,
  onReject,
}) {
  if (!isOpen || !enhancedData) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-lg font-semibold mb-2">AI Suggestions</h2>
        <p className="mb-2">{enhancedData.reasoning}</p>
        <ul className="list-disc list-inside mb-4">
          {enhancedData.descriptions.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
        <p className="mb-1">
          Category: {enhancedData.category.name}
        </p>
        <p className="mb-1">
          Priority: {enhancedData.priority_score}
        </p>
        <p className="mb-4">
          Deadline: {new Date(enhancedData.suggested_deadline).toLocaleDateString()}
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onReject()}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Reject
          </button>
          <button
            onClick={() => onAccept(enhancedData)}
            className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
