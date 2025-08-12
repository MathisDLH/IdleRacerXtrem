import { createContext, useContext, useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'
import { useAuth } from './Auth.tsx'

const WS_URL = import.meta.env.VITE_WS_URL

interface WebSocketContextInterface {
  socket: any
}

const WebSocketContext = createContext({
  socket: null as any
})

const WebSocketProvider = (props: any): JSX.Element => {
  const { token } = useAuth()
  const url = WS_URL
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (!url || !token) {
      // no connection without a token
      return
    }
    const s = io(url, {
      auth: {
        token: `Bearer ${token}`
      }
    })
    setSocket(s)
    return () => {
      s.disconnect()
      setSocket(null)
    }
  }, [url, token])

  const value: WebSocketContextInterface = {
    socket
  }

  return (
    <WebSocketContext.Provider value={value}>
      {props.children}
    </WebSocketContext.Provider>
  )
}

const useWebSocket = (): WebSocketContextInterface => {
  return useContext(WebSocketContext)
}

export { WebSocketProvider, useWebSocket }
