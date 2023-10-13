import {motion} from 'framer-motion';
import {useState} from 'react';

import IconButton from '@mui/material/IconButton';

import first from "../assets/images/game/cars/6.png";
import shop from "../assets/images/game/icons/shop.png";
import '../assets/styles/Game.scss';

import DraggableDialog from "../components/DraggableDialog.tsx";

const Game = () => {

    const bonus :number = 1;
    const [money, setMoney] = useState(0);
    const [shopOpen, setShopOpen] = useState(false);

    const toggleShop = () :void => {
        setShopOpen(!shopOpen);
    }

    const click = () => {
        setMoney(money + bonus);
    }

    return(
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
            <div>
                <DraggableDialog open={shopOpen} setOpen={setShopOpen} title={"Shop"} content={"TODO"}>
                </DraggableDialog>
            </div>
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

export default Game;
