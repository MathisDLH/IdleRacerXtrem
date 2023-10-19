import React, { useState } from 'react';
import { useAuth } from '../context/Auth';
import '../assets/styles/LoginForm.scss'
import { Link } from 'react-router-dom';

// Typage des props
interface LoginModalProps {
  closeModal: () => void;
}

const LoginForm: React.FC<LoginModalProps> = ({closeModal}) => {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      console.log('Utilisateur connecté avec succès');
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la connexion', error);
      setError('Identifiants incorrects. Veuillez réessayer.');
    }
  };

  return (
      <div className="modal-content">
        <h1>LOGIN</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <p>EMAIL</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <p>PASSWORD</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>
          <button type="submit" className="start-button">
            Se connecter
          </button>
          <Link to='/register' style={{cursor: 'pointer', color: 'black', textDecoration: 'underline'}}><p>New Account</p></Link>
          <p style={{cursor: 'pointer', color: 'black', textDecoration: 'underline'}} onClick={closeModal}>Close</p>
        </form>
      </div>
  );
};

export default LoginForm;
