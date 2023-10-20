import '../assets/styles/Upgrade.scss';
import {UpgradeModel} from '../models/Upgrade.tsx';
import GameButton from "./GameButton.tsx";

export default function Upgrade(upgrade: UpgradeModel) {

    function click(){

    }

    return(
        <div className={"upgrade prevent-select"}>
            <span>{upgrade.name}</span>
            <GameButton color={"green"} text={upgrade.price + "$"} click={click}></GameButton>
        </div>
    )
}