import React from 'react';
import {motion} from 'framer-motion';
import '../assets/styles/Game.scss';
const Game = () => {

    const click = () => {
        console.log("click");
    }

    return(
        <motion.div
        initial={{ opacity: 0, scale: 0, rotate: 45 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0, rotate: 45 }}
        >
                    <section id="game" onClick={click}>
            <div id="up">
                <div id="sun">

                </div>
            </div>
            <div id="down">

            </div>
        </section>
        </motion.div>

    )
}

export default Game;
