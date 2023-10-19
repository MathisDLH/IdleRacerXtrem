import {motion} from 'framer-motion';
import {useEffect, useState} from 'react';
import IconButton from '@mui/material/IconButton';

import first from "../assets/images/game/cars/6.png";
import shop from "../assets/images/game/icons/shop.png";
import '../assets/styles/Game.scss';

import DraggableDialog from "../components/DraggableDialog.tsx";
import UpgradesList from "../components/UpgradesList.tsx";

const Game = () => {

    const [bonus] = useState(1);
    const [money, setMoney] = useState(0);
    const [shopOpen, setShopOpen] = useState(false);

    const toggleShop = () :void => {
        setShopOpen(!shopOpen);
    }

    const click = () => {
        setMoney(money + bonus);
    }

    useEffect(() => {
        const id = setInterval(() => setMoney((oldMoney) => oldMoney + bonus), 500);
        return () => {
            clearInterval(id);
        };
    }, []);

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

            <DraggableDialog open={shopOpen} title={"Upgrades"} icon={shop} setOpen={setShopOpen} Content={<UpgradesList/>}>
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

export default Game;
