import React from 'react';
import '../assets/styles/Game.scss';
const Game = () => {

    const click = () => {
        console.log("click");
    }

    return(
        <section id="game" onClick={click}>
            <div id="up">
                <div id="sun">

                </div>
            </div>
            <div id="down">

            </div>
        </section>
    )
}

export default Game;
