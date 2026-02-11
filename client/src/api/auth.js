import apiClient from './client.js'

export const login = async (identifier, password) => {
  const { data } = await apiClient.post('/auth/login', {
    identifier: identifier?.trim(),
    password,
  })
  return data
}
