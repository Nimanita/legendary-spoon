import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h2 className="text-4xl font-bold text-purple-600">
        404 Not Found
      </h2>
      <p className="mt-4">
        Sorry, we couldn’t find that page.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Go Home
      </Link>
    </div>
  )
}
