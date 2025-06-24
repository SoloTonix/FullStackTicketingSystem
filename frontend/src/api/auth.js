import axios from 'axios'

const API_URL = 'http://localhost:8000/users/'

const register = async (userData) => {
  const response = await axios.post(`${API_URL}register/`, userData)
  return response.data
}

const login = async (credentials) => {
  const response = await axios.post(`${API_URL}login/`, credentials)
  if (response.data.access) {
    localStorage.setItem('user', JSON.stringify(response.data))
  }
  return response.data
}

const logout = () => {
  localStorage.removeItem('user')
}

const getProfile = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }
  const response = await axios.get(`${API_URL}profile/`, config)
  return response.data
}

const refreshToken = async (refreshToken) => {
  const response = await axios.post(`${API_URL}token/refresh/`, { refresh: refreshToken })
  return response.data
}

export default {
  register,
  login,
  logout,
  getProfile,
  refreshToken
}