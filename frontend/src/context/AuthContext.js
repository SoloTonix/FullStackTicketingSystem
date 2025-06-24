import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authApi from '../api/auth'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'))
      
      if (storedUser?.access) {
        try {
          const profile = await authApi.getProfile(storedUser.access)
          setUser({ ...storedUser, ...profile })
          setIsAuthenticated(true)
        } catch (error) {
          if (error.response?.status === 401 && storedUser.refresh) {
            try {
              const { access } = await authApi.refreshToken(storedUser.refresh)
              const newUser = { ...storedUser, access }
              localStorage.setItem('user', JSON.stringify(newUser))
              const profile = await authApi.getProfile(access)
              setUser({ ...newUser, ...profile })
              setIsAuthenticated(true)
            } catch {
              logout()
            }
          } else {
            logout()
          }
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const userData = await authApi.login(credentials)
      const profile = await authApi.getProfile(userData.access)
      setUser({ ...userData, ...profile })
      setIsAuthenticated(true)
      navigate('/')
      return true
    } catch (error) {
      return false
    }
  }

  const register = async (userData) => {
    try {
      await authApi.register(userData)
      navigate('/login')
      return true
    } catch (error) {
      return false
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    setIsAuthenticated(false)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)