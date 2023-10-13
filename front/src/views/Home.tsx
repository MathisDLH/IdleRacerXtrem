import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Home.scss'; // Importez votre fichier CSS ici
import backgroundImage from '../assets/images/idle_racer_bg.png'; // Chemin vers l'image
import flags from '../assets/images/race_flag.png';
import {motion} from 'framer-motion';


const Home = () => {
  return (
    <motion.div className="menu" style={{ backgroundImage: `url(${backgroundImage})` }}
    
    initial={{ opacity: 0, scale: 0, rotate: 45 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
    exit={{ opacity: 0, scale: 0, rotate: 45 }}
    >
      <div className="menu-content">
        <img src={flags} alt="race_flag" className="image-above-title" />
        <h1 className="game-title">Idle Racer</h1>
        <Link to="/game">
          <button className="start-button">START</button>
        </Link>
      </div>
    </motion.div>
  );
}

export default Home;
