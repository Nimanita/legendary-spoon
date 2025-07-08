import { useState, useEffect, useCallback } from 'react'
import { getTasks } from '../services/api'

export default function useTasks(initialFilters = {}) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await getTasks(filters)
      setTasks(resp.data.data || [])
    } catch (e) {
      setError(e.message || 'Error fetching tasks')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { tasks, loading, error, filters, setFilters, reload: fetch }
}