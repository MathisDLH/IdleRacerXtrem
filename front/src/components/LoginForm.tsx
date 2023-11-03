import React, { useState } from 'react'
import { useAuth } from '../context/Auth'
import '../assets/styles/LoginForm.scss'
import { Link } from 'react-router-dom'

interface Props {
  setOpen: any
}

const LoginForm = ({ setOpen }: Props): JSX.Element => {
  const { signIn } = useAuth()

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)

    try {
      await signIn(name, password)
      setOpen(false)
    } catch (error) {
      setError('Identifiants incorrects. Veuillez réessayer.')
    }
  }

  return (
    <div className="login-container">
      <h1 className="login-heading">LOGIN</h1>
      {(error != null) && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <p className="form-label">NAME</p>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value) }}
            className="form-login-input"
          />
        </div>
        <div className="form-group">
          <p className="form-label">PASSWORD</p>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value) }}
            className="form-login-input"
          />
        </div>
        <button type="submit" className="btn-hover color-4">
          LOGIN
        </button>
        <Link to='/register' className="new-account-link"><p>New Account</p></Link>
        <p className="close-link" onClick={() => setOpen(false)}>Close</p>
      </form>
    </div>
  )
}

export default LoginForm
