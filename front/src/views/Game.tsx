import {motion} from 'framer-motion';
import React, {useState} from 'react';
import first from "../assets/images/game/cars/6.png";
import IconButton from '@mui/material/IconButton';
import '../assets/styles/Game.scss';

const Game = () => {

    const bonus :number = 1;
    const [money, setMoney] = useState(0);

    const click = () => {
        setMoney(money + bonus);
        console.log(money);
    }

    return(
        <motion.div
        initial={{ opacity: 0, scale: 0, rotate: 45 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0, rotate: 45 }}
        >
  <section id="game" onClick={click}>
            <header>
                <span>IDLE RACER XTREM</span>
                <IconButton id="shop" aria-label="delete" size="large">
                </IconButton>
            </header>
            <div id="up">
                <div id="sun"></div>
            </div>
            <div id="down">

                <div id="road-line"></div>
                <div id="car-shadow"></div>
                <img id="car" src={first} alt=""/>
            </div>
        </section>
        </motion.div>

    )
}

export default Game;
