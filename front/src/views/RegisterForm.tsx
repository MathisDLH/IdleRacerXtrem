import { useState } from 'react'
import { useAuth } from '../context/Auth'
import { Link, useNavigate } from 'react-router-dom'

import backgroundImage from '../assets/images/idle_racer_bg.png' // Chemin vers l'image
import flags from '../assets/images/race_flag.png'
import { motion } from 'framer-motion'

const RegisterForm = (): JSX.Element => {
  const { register } = useAuth()

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSignup = async (e: any): Promise<void> => {
    e.preventDefault()

    try {
      const [userData] = await Promise.all([register(name, email, password)])
      navigate('/')
      console.log('Utilisateur inscrit avec succès:', userData)
    } catch (error) {
      console.error('Erreur lors de l\'inscription', error)
    }
  }

  return (
    <motion.div
      className="menu"
      style={{
        backgroundImage: `url(${backgroundImage})`
      }}
      initial={{ opacity: 0, scale: 0, rotate: 45 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0, rotate: 45 }}
    >
      <div className="menu-content">
        <img src={flags} alt="race_flag" className="image-above-title" />
        <h1 className="game-title">Idle Racer</h1>
        <h1 className="page-title">Sign Up</h1>
        <div className='form-container'>
        <form onSubmit={handleSignup} className="form">
        <div className="form-group">
          <label htmlFor="login">Login name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value) }}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="Email">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value) }}
              className="form-input"
            />
          </div>
          <div className="form-group">
          <label htmlFor="password">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value) }}
              className="form-input"
            />
          </div>
          <button type="submit" className="btn-hover color-4">
            Register
          </button>
        </form>
        </div>
        <Link to='/' style={{ cursor: 'pointer', color: 'black', textDecoration: 'underline' }}><p>EXIT</p></Link>
      </div>
    </motion.div>
  )
}

export default RegisterForm
