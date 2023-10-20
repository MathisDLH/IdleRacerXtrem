import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import IconButton from '@mui/material/IconButton'

import first from '../assets/images/game/cars/6.png'
import shop from '../assets/images/game/icons/shop.png'
import '../assets/styles/Game.scss'

import DraggableDialog from '../components/DraggableDialog.tsx'
import UpgradesList from '../components/UpgradesList.tsx'

import io from "socket.io-client";
import {useAuth} from "../context/Auth.tsx";

const Game = (): JSX.Element => {
  const {token} = useAuth();
  const socket = io("ws://localhost:3000?token=" + token?.split("\"")[1].split("\"")[0], {transports: ['websocket']});
  const [money, setMoney] = useState(0)
  const [shopOpen, setShopOpen] = useState(false)

  const toggleShop = (): void => {
    setShopOpen(!shopOpen)
  }

  const click = (): void => {
	  socket.emit("click");
  }

  useEffect(() => {
	  socket.on("connect", () => {
	  });
	  
	  socket.on("disconnect", (reason) => {
		  console.log(reason.includes("server") ? "disconnected by server" : "disconnected by client");
	  });
	  
	  socket.on("money", (data:any) => {
		  //TODO change once the type of data is changed
		  const currentMoney:number = parseInt(data.split('UNIT')[0]);
		  setMoney(currentMoney);
	  });
  }, [])

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
                        <img src={shop} alt=""/>
                    </IconButton>
                </div>
            </header>

            <DraggableDialog open={shopOpen} title={'Upgrades'} icon={shop} setOpen={setShopOpen} Content={<UpgradesList/>}>
            </DraggableDialog>

            <div id="up" onClick={click}>
                <div id="sun"></div>
            </div>
            <div id="down" onClick={click}>

                <div id="road-line"></div>
                <div id="car-shadow"></div>
                <img id="car" src={first} alt=""/>
            </div>
        </section>
        </motion.div>

  )
}

export default Game
