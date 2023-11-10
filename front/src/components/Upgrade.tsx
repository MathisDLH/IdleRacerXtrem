import '../assets/styles/Upgrade.scss'
import '../assets/styles/LuxuryButtons.scss'
import type UpgradeInterface from '../interfaces/upgrade.interface.ts'
import * as UpgradeService from '../services/upgrades.service.ts'
import { useEffect } from 'react'
import { Units } from '../enums/units.tsx'

export default function Upgrade (props: { token?: string, upgrade: UpgradeInterface }): JSX.Element {
  const { token, upgrade } = props
  async function click (): Promise<void> {
    await UpgradeService.buyUpgrade(token ?? '', { upgrade_id: upgrade.id, quantity: 1 })
  }

  useEffect(() => {
    console.log(upgrade)
  }, [])

  function calculateUnit (): string {
    const unit = Units[upgrade.price_unit]
    switch (upgrade.price_unit) {
      case 0:
        return '$'
      default:
        return ` ${unit} $`
    }
  }

  return (
    <div className={'upgrade prevent-select'}>
      <span>{upgrade.name}</span>
      <div>
        <button className={'btn-hover color-4'} onClick={click}>
          <span className={'price'}>{upgrade.price}</span>
          <span className={'unit'}>{calculateUnit()}</span>
        </button>
      </div>
    </div>
  )
}
