import { Link } from 'react-router-dom';
import '../assets/styles/Home.scss'; // Importez votre fichier CSS ici
import backgroundImage from '../assets/images/idle_racer_bg.png'; // Chemin vers l'image
import flags from '../assets/images/race_flag.png';
import carIcon from '../assets/images/auth/car_icon.png';
import { motion } from 'framer-motion';
import { useAuth } from '../context/Auth';
import { useState } from 'react';
import LoginForm from './LoginForm';
import { Modal } from '@mui/material';

const Home = () => {

  const { user, isLoggedIn } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);

  const closeModal = () => {
    setModalVisible(false);
  }

  return (
    <motion.div style={{ backgroundImage: `url(${backgroundImage})` }}

      initial={{ opacity: 0, scale: 0, rotate: 45 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0, rotate: 45 }}
    >
      <Modal open={modalVisible} className='login-modal'>
        <LoginForm closeModal={closeModal} />
      </Modal>
      <div className='head-container' onClick={() => { if (!isLoggedIn) { setModalVisible(true) } }}>
        <img alt='car_icon' src={carIcon} className='car-icon' />
        <p>{isLoggedIn && user ? user.email : "Login"}</p>
      </div>
      <div className="menu">
        <div className="menu-content">
          <img src={flags} alt="race_flag" className="image-above-title" />
          <h1 className="game-title">Idle Racer</h1>
          <Link to="/game">
            <button className={user ? "start-button" : "start-button-desactived"}>START</button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default Home;
