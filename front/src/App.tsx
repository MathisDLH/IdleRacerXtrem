import { BrowserRouter as Router } from 'react-router-dom'
import './assets/styles/App.scss'
import AnimatedRoutes from './components/AnimatedRoutes'
import { AuthProvider } from './context/Auth'

function App (): JSX.Element {
  return (
    <Router>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App
