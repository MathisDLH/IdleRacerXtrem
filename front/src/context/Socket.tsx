import { createContext, useContext, useEffect } from 'react'
import io from 'socket.io-client'
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

  const url = WS_URL + '?token=' + token
  const socket = io(url, { transports: ['websocket'] })

  useEffect(() => {
    return () => {
      socket.disconnect()
    }
  }, [socket])

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
