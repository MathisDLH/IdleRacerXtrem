import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import IconButton from '@mui/material/IconButton'

import first from '../assets/images/game/cars/6.png'
import shop from '../assets/images/game/icons/shop.png'
import '../assets/styles/Game.scss'

import DraggableDialog from '../components/DraggableDialog.tsx'
import UpgradesList from '../components/UpgradesList.tsx'
import { useWebSocket } from '../context/Socket.tsx'

interface WebSocketContextInterface {
  socket: any
}

const Game = (): JSX.Element => {
  const { socket }: WebSocketContextInterface = useWebSocket()
  const [money, setMoney] = useState<number>(0)
  const [shopOpen, setShopOpen] = useState<boolean>(false)

  const toggleShop = (): void => {
    setShopOpen(!shopOpen)
  }

  const click = (): void => {
    if (socket) {
      socket.emit('click')
    } else {
      console.log('Socket is null')
    }
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
        // TODO change once the type of data is changed
        console.log('Received', data)
        const currentMoney: number = parseInt(data.split('UNIT')[0])
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
          <img id="car" src={first} alt="" />
        </div>
      </section>
    </motion.div>
  )
}

export default Game
