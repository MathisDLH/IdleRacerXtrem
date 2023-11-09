import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import IconButton from '@mui/material/IconButton'

import shop from '../assets/images/game/icons/shop.png'
import '../assets/styles/Game.scss'

import DraggableDialog from '../components/DraggableDialog.tsx'
import UpgradesList from '../components/UpgradesList.tsx'
import { useWebSocket } from '../context/Socket.tsx'
import { useAuth } from '../context/Auth.tsx'
import { cars } from '../utils/cars.utils.ts'

interface WebSocketContextInterface {
  socket: any
}

const Game = (): JSX.Element => {
  const { socket }: WebSocketContextInterface = useWebSocket()
  const [money, setMoney] = useState<number>(0)
  const [oldMoney, setOldMoney] = useState<number>(0)
  const [difference, setDifference] = useState<number>(0)
  const [shopOpen, setShopOpen] = useState<boolean>(false)

  const { user } = useAuth()

  const toggleShop = (): void => {
    setShopOpen(!shopOpen)
  }

  const click = (event: any): void => {
    if (socket) {
      setOldMoney(money)
      socket.emit('click')
      setDifference(money - oldMoney)
      createClickEffect(event)
    } else {
      console.log('Socket is null')
    }
  }
  const createClickEffect = (event: any): void => {
    const clickEffect = document.createElement('div')
    const max = 50
    const randomX = Math.floor(Math.random() * max) + 1
    const randomY = Math.floor(Math.random() * max) + 1
    const randomDirectionX = Math.floor(Math.random() * 2) + 1 === 1 ? '-' : '+'
    const randomDirectionY = Math.floor(Math.random() * 2) + 1 === 1 ? '-' : '+'
    const x = randomDirectionX === '-' ? event.clientX - randomX : event.clientX + randomX
    const y = randomDirectionY === '-' ? event.clientY - randomY : event.clientY + randomY
    clickEffect.textContent = `+${difference}$`
    clickEffect.className = 'click_effect'
    clickEffect.style.top = `${y}px`
    clickEffect.style.left = `${x}px`
    document.body.appendChild(clickEffect)

    setTimeout(() => {
      clickEffect.className = 'click_effect removed'
      setTimeout(() => {
        clickEffect.remove()
      }, 1000)
    }, 500)
  }

  // Moved socket event listeners outside of the useEffect
  // to ensure they are set up only once.
  useEffect(() => {
    if (socket) {
      const onConnect = (): void => {}
      const onDisconnect = (reason: string): void => {
        console.log(reason.includes('server') ? 'Disconnected by server' : 'Disconnected by client')
      }
      const onMoney = (data: any): void => {
        // console.log(data)
        const currentMoney: number = data.money
        setMoney(currentMoney)
      }

      socket.on('connect', onConnect)
      socket.on('disconnect', onDisconnect)
      socket.on('money', onMoney)

      return () => {
        // Clean up event listeners when the component unmounts.
        socket.off('connect', onConnect)
        socket.off('disconnect', onDisconnect)
        socket.off('money', onMoney)
      }
    }
  }, [socket])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: 45 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0, rotate: 45 }}
    >
      <section id="game">
        <header>
          <span className="part">{money}$</span>
          <div>
            <IconButton className="icon" aria-label="delete" size="large" onClick={toggleShop}>
              <img src={shop} alt="" />
            </IconButton>
          </div>
        </header>

        <DraggableDialog open={shopOpen} title={'Upgrades'} icon={shop} size="small" setOpen={setShopOpen} Content={<UpgradesList />} />

        <div id="up" onClick={click}>
          <div id="sun"></div>
        </div>
        <div id="down" onClick={click}>
          <div id="road-line"></div>
          <div id="car-shadow"></div>
          <img id="car" src={cars[user!.skin_id]} alt="" />
        </div>
      </section>
    </motion.div>
  )
}

export default Game
