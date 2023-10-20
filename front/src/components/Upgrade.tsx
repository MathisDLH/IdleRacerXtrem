import '../assets/styles/Upgrade.scss'
import { type UpgradeModel } from '../models/Upgrade.tsx'

export default function Upgrade (upgrade: UpgradeModel): JSX.Element {
  return (
        <div className={'upgrade'}>
            {upgrade.name}
        </div>
  )
}
