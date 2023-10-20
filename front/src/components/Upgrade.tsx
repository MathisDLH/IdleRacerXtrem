import '../assets/styles/Upgrade.scss'
import { type UpgradeModel } from '../models/Upgrade.tsx'

export default function Upgrade (upgrade: UpgradeModel) {
  return (
        <div className={'upgrade'}>
            {upgrade.name}
        </div>
  )
}
