import { BrowserRouter as Router } from 'react-router-dom'
import './assets/styles/App.scss'
import AnimatedRoutes from './components/AnimatedRoutes'
import { AuthProvider } from './context/Auth'
import {WebSocketProvider} from "./context/Socket.tsx";

function App (): JSX.Element {
  return (
    <Router>
      <AuthProvider>
        <WebSocketProvider>
          <AnimatedRoutes />
        </WebSocketProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
