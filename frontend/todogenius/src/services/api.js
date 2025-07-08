import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

export const getTasks = (params) => api.get('/tasks/tasks-list/', { params })
export const createTask = (data) => api.post('/tasks/tasks-list/', data)
export const updateTask = (id, data) => api.put(`/tasks/${id}/`, data)
export const deleteTask = (id) => api.delete(`/tasks/${id}/`)

export const enhanceTask = (task_name) =>
  api.post('/ai/enhance-task/', { task_name })

export const getContext = (params) => api.get('/context/', { params })
export const createContext = (data) => api.post('/context/', data)

export const getCategories = () => api.get('/tasks/categories/')


