import React, { createContext, useContext, useMemo, useState } from 'react'
import { getStoredToken, getStoredRole } from '../api/client.js'

const TOKEN_KEY = 'iqra_token'
const ROLE_KEY = 'iqra_role'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => getStoredToken())
  const [role, setRoleState] = useState(() => getStoredRole())
  const [user, setUser] = useState(null)

  const setLogin = (newToken, userData, newRole) => {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken)
      setTokenState(newToken)
    }
    if (newRole) {
      localStorage.setItem(ROLE_KEY, newRole)
      setRoleState(newRole)
    }
    if (userData) setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
    setTokenState(null)
    setRoleState('')
    setUser(null)
  }

  const getToken = () => Promise.resolve(token || localStorage.getItem(TOKEN_KEY))

  const value = useMemo(
    () => ({
      token,
      role,
      user,
      isAuthenticated: Boolean(token),
      setLogin,
      logout,
      getToken,
    }),
    [token, role, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
