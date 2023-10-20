import '../assets/styles/Home.scss' // Importez votre fichier CSS ici
import backgroundImage from '../assets/images/page_not_found.jpg'
import { motion } from 'framer-motion'

const NotFoundPage = () => {
  return (
    <motion.div className="menu" style={{ backgroundImage: `url(${backgroundImage})` }}

    initial={{ opacity: 0, scale: 0, rotate: 45 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
    exit={{ opacity: 0, scale: 0, rotate: 45 }}
    >
        <div style={{ backgroundColor: 'white' }}>
            <h1>404</h1>
            <h2>VOUS ÊTES TROP RAPIDE</h2>
        </div>
    </motion.div>
  )
}

export default NotFoundPage
