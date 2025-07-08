import { useState, useEffect, useCallback } from 'react'
import { getContext } from '../services/api'

export default function useContextEntries(initialParams = {}) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await getContext(params)
      setEntries(resp.data.data || [])
    } catch (e) {
      setError(e.message || 'Error fetching context')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { entries, loading, error, params, setParams, reload: fetch }
}
