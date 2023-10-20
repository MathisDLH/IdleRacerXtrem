import { Route, Routes, useLocation } from 'react-router-dom'
import Home from '../views/Home'
import Game from '../views/Game'
import Race from '../views/Race'

import { AnimatePresence } from 'framer-motion'
import NotFoundPage from '../views/NotFoundPage'
import RegisterForm from '../views/RegisterForm'
import { useAuth } from '../context/Auth'

const AnimatedRoutes = (): JSX.Element => {
  const location = useLocation()
  const { isLoggedIn } = useAuth()
  console.log(isLoggedIn)

  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        {!isLoggedIn && <Route path='/register' element={<RegisterForm />} />}
        {isLoggedIn && < Route path="/game" element={<Game />} />}
        {isLoggedIn && <Route path="/race" element={<Race />} />}
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  )
}

export default AnimatedRoutes
