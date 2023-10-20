import '../assets/styles/UpgradesList.scss'
import upgrades from '../assets/mock/upgrades.json'
import Upgrade from './Upgrade.tsx'
import { type UpgradeModel } from '../models/Upgrade.tsx'

export default function UpgradesList (): JSX.Element {
  return (
        <div id={'list'} className={'upgrades'}>
            {upgrades.money.click.map((upgrade: UpgradeModel) => {
              return (
                    <Upgrade
                        key={upgrade.id}
                        id={upgrade.id}
                        name={upgrade.name}
                        price={upgrade.price}
                        value={upgrade.value}
                    />
              )
            })}
        </div>
  )
}
