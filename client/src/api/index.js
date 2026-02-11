import apiClient, { getToken, clearAuthStorage, getStoredToken, getStoredRole } from './client.js'
import { login } from './auth.js'

export default apiClient
export { getToken, clearAuthStorage, getStoredToken, getStoredRole, login }
