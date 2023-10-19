import '../assets/styles/Upgrade.scss';
import {UpgradeModel} from '../models/Upgrade.tsx';

export default function Upgrade(upgrade: UpgradeModel) {

    return(
        <div className={"upgrade"}>
            {upgrade.name}
        </div>
    )
}