import { Link } from 'react-router-dom'
import '../assets/styles/Home.scss'
import backgroundImage from '../assets/images/idle_racer_bg.png'
import flags from '../assets/images/race_flag.png'
import carIcon from '../assets/images/auth/car_icon.png'
import { motion } from 'framer-motion'
import { useAuth } from '../context/Auth'
import { useState } from 'react'
import LoginForm from '../components/LoginForm'
import DraggableDialog from '../components/DraggableDialog'

const Home = (): JSX.Element => {
  const { user, isLoggedIn, signout } = useAuth()
  const [modalVisible, setModalVisible] = useState(false)
  const [modalSignOutVisible, setModalSignoutVisible] = useState(false)

  const SignOutModal = (): JSX.Element => {
    return (
      <div style={{textAlign: 'center', padding:'1em'}}>
        <p>Are you sure you want to logout ?</p>
        <button onClick={() => {
          signout()
          setModalSignoutVisible(false)
        }} className='btn-hover color-4'>Yes</button>
        <p className='logout-exit' onClick={() => {setModalSignoutVisible(false)}}>No</p>
      </div>
    )
  }

  return (
    <motion.div style={{ backgroundImage: `url(${backgroundImage})` }}
      className="background-image"
      initial={{ opacity: 0, scale: 0, rotate: 45 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0, rotate: 45 }}
    >
      <DraggableDialog icon={carIcon} open={modalVisible} size="big" setOpen={setModalVisible} title="Login" Content={<LoginForm setOpen={setModalVisible} />} />
      {(user != null) && <DraggableDialog icon={carIcon} open={modalSignOutVisible} size="big" setOpen={setModalSignoutVisible} title={user.name} Content={<SignOutModal />} />}
      <div className='head-container' onClick={() => { if (!isLoggedIn) { setModalVisible(true) } else { setModalSignoutVisible(true) } }}>
        <img alt='car_icon' src={carIcon} className='car-icon' />
        <p>{isLoggedIn && (user != null) ? `${user.name} - Logout` : 'Login'}</p>
      </div>
      <div className="menu">
        <div className="menu-content">
          <img src={flags} alt="race_flag" className="image-above-title" />
          <h1 className="game-title">Idle Racer</h1>
          <Link to="/game">
            <button className={(user != null) ? 'btn-hover color-4' : 'start-button-desactived'}>START</button>
          </Link>
          <div style={{ marginTop: '1em' }}>
            <Link to="/scores">
            <button className={(user != null) ? 'btn-hover color-4' : 'start-button-desactived'}>SCORES</button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Home
