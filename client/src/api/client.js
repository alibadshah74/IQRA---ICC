import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const TOKEN_KEY = 'iqra_token'
const ROLE_KEY = 'iqra_role'

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY)
export const getStoredRole = () => localStorage.getItem(ROLE_KEY)

export const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  if (typeof window !== 'undefined') {
    window.location.href = '/'
  }
}

const apiClient = axios.create({ baseURL, withCredentials: true })

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      clearAuthStorage()
    }
    return Promise.reject(err)
  },
)

export default apiClient

export const getToken = () => Promise.resolve(localStorage.getItem(TOKEN_KEY))
