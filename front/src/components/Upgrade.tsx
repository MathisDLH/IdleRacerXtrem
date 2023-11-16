import '../assets/styles/Upgrade.scss'
import '../assets/styles/LuxuryButtons.scss'
import type UpgradeInterface from '../interfaces/upgrade.interface.ts'
import UpgradeCount from './UpgradeCount.tsx'
import UpgradeButton from './UpgradeButton.tsx'


export default function Upgrade (props: { token?: string, upgrade: UpgradeInterface }): JSX.Element {
  const { token, upgrade } = props


  return (
    <div className={'upgrade prevent-select'}>
      <span>{upgrade.name}</span>
      <UpgradeCount amount={upgrade.amount} unit={upgrade.amountUnit} />
      <div>
        <UpgradeButton token={token} basicPrice={upgrade.price} unit={upgrade.price_unit} upgradeId={upgrade.id} amountBought={upgrade.amountBought}/>
      </div>
    </div>
  )
}
