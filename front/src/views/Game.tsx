import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import shop from '../assets/images/game/icons/shop.png'
import back from '../assets/images/game/icons/back.png'
import '../assets/styles/Game.scss'

import DraggableDialog from '../components/DraggableDialog.tsx'
import UpgradesList from '../components/UpgradesList.tsx'
import IconButton from '@mui/material/IconButton'

import type WebSocketContextInterface from '../interfaces/websocketcontext.interface.ts'
import { useWebSocket } from '../context/Socket.tsx'
import { useAuth } from '../context/Auth.tsx'

import { cars } from '../utils/cars.utils.ts'
import { eventEmitter } from '../utils/event-emitter.ts'
import background from '../assets/images/game/background.png'
import road from '../assets/images/game/road.png'

const Game = (): JSX.Element => {
  const { socket }: WebSocketContextInterface = useWebSocket()
  const [money, setMoney] = useState<number>(0)
  const [oldMoney, setOldMoney] = useState<number>(0)
  const [difference, setDifference] = useState<number>(0)
  const [shopOpen, setShopOpen] = useState<boolean>(false)
  const { user } = useAuth()
  const [skin, setSkin] = useState<string>(cars[0])
  // const [carPosition, setCarPosition] = useState<number>(0)

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

  const goHome = (): void => {
    window.location.href = '/'
  }

  /**
   * Socket events
   */
  useEffect(() => {
    if (socket) {
      const onConnect = (): void => {}
      const onDisconnect = (reason: string): void => {
        console.log(reason.includes('server') ? 'Disconnected by server' : 'Disconnected by client')
      }
      const onMoney = (data: any): void => {
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

  /**
   * Skin event
   */
  useEffect(() => {
    eventEmitter.on('skin', (event: any) => {
      setSkin(event.path)
      const car = document.getElementById('car')
      const rect = car?.getBoundingClientRect()
      const carBottomPosition = rect?.bottom ?? 0
      console.log(carBottomPosition)
    })
  }, [])


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: 45 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0, rotate: 45 }}
    >
      <section id="game">
        <header>
          <div className={'left'}>
            <IconButton className="icon" size="large" onClick={goHome}>
              <img src={back} alt={''}/>
            </IconButton>
          </div>
          <div className={'right'}>
            <span className="part prevent-select">{money + '$'}</span>
            <IconButton className="icon" aria-label="shop" size="large" onClick={toggleShop}>
              <img src={shop} alt={''} />
            </IconButton>
          </div>
        </header>

        <DraggableDialog open={shopOpen} title={'Upgrades'} icon={shop} size="small" setOpen={setShopOpen} Content={<UpgradesList />} />

        <div id="up" style={{ backgroundImage: `url(${background})` }} onClick={click}>

        </div>
        <div id="down" style={{ backgroundImage: `url(${road})` }} onClick={click}>
          <div id="road-line"></div>
          <div id="car-shadow"></div>
          <img id="car" src={skin ?? cars[0]} alt="" />
        </div>
      </section>
    </motion.div>
  )
}

export default Game
