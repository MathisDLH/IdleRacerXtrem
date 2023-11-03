import { BrowserRouter as Router } from 'react-router-dom'
import './assets/styles/App.scss'
import AnimatedRoutes from './components/AnimatedRoutes'
import { AuthProvider } from './context/Auth'
import { WebSocketProvider } from './context/Socket.tsx'
import { createTheme, ThemeProvider, type Theme } from '@mui/material/styles'

const theme: Theme = createTheme({
  palette: {
    primary: {
      main: import.meta.env.VITE_PRIMARY_COLOR
    },
    secondary: {
      main: import.meta.env.VITE_SECONDARY_COLOR
    }
  }
})
function App (): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <WebSocketProvider>
            <AnimatedRoutes />
          </WebSocketProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
