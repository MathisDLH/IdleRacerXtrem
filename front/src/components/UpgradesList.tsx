import '../assets/styles/UpgradesList.scss';
import upgrades from "../assets/mock/upgrades.json";
import Upgrade from "./Upgrade.tsx";

export default function UpgradesList() {

    return(
        <div className={"upgrades"}>
            {upgrades.motors.map((motor ) => {
                return(
                    <Upgrade motor={motor}/>
                );
            })}
        </div>
    )
}