// Auth.tsx
import { createContext, useContext, useState, useEffect } from 'react'
import { type User } from '../interfaces/user.interface'
import * as userService from '../services/auth.service'
import jwt_decode from 'jwt-decode'

function removeQuotes (inputString: string): string {
  if (inputString.startsWith('"') && inputString.endsWith('"')) {
    return inputString.slice(1, -1)
  } else {
    return inputString
  }
}

const AuthContext = createContext({
  user: null as User | null,
  isLoggedIn: false,
  token: null as string | null,
  signIn: async (_name: string, _password: string): Promise<void> => { },
  signout: () => { },
  register: async (_name: string, _email: string, _password: string): Promise<void> => { },
  setUser: (_user: User) => { }
})

interface AuthContextInterface {
  user: User | null
  isLoggedIn: boolean
  token: string | null
  signIn: (name: string, password: string) => Promise<void>
  signout: () => void
  register: (name: string, email: string, password: string) => Promise<void>
  setUser: (user: User) => void
}
export const useAuth = (): AuthContextInterface => {
  return useContext(AuthContext)
}

export const AuthProvider = (props: any): JSX.Element => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('access_token')
    if (raw != null) {
      const token = removeQuotes(raw)
      try {
        const decoded: any = jwt_decode(token)
        if (decoded.userId === undefined) throw new Error('Token d\'accès non valide.')
        userService.getUser(decoded.userId)
          .then((user: User) => {
            setUser(user)
            setIsLoggedIn(true)
            setToken(token)
          })
          .catch((error) => {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error)
          })
      } catch {
        // token invalide/expiré en cache → nettoyage
        localStorage.removeItem('access_token')
      }
    }
  }, [])

  const signIn = async (name: string, password: string): Promise<void> => {
    try {
      const tokens = await userService.loginUser(name, password)
      const accessToken = tokens.access_token
      const refreshToken = tokens.refresh_token
      if (accessToken != null) {
        const decoded: any = jwt_decode(accessToken)
        if (decoded.userId === undefined) throw new Error('Token d\'accès non valide.')
        const user: User = await userService.getUser(decoded.userId)
        setUser(user)
        setIsLoggedIn(true)
        localStorage.setItem('access_token', JSON.stringify(accessToken))
        if (refreshToken) localStorage.setItem('refresh_token', JSON.stringify(refreshToken))
        window.location.reload()
      } else {
        console.error('Token d\'accès non valide.')
      }
    } catch (error) {
      console.error('Erreur lors de la connexion de l\'utilisateur:', error)
    }
  }

  const register = async (name: string, email: string, password: string): Promise<void> => {
    await userService.createUser(name, email, password)
  }

  const signout = (): void => {
    setUser(null)
    setIsLoggedIn(false)
    setToken(null)
    localStorage.removeItem('access_token')
  }


  const value: AuthContextInterface = {
    user,
    isLoggedIn,
    token,
    signIn,
    signout,
    register,
    setUser
  }

  return (
        <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  )
}
