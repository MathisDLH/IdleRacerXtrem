import '../assets/styles/Upgrade.scss'
import '../assets/styles/LuxuryButtons.scss'
import type UpgradeInterface from '../interfaces/upgrade.interface.ts'
import * as UpgradeService from '../services/upgrades.service.ts'
import { useEffect } from 'react'
import { calculateUnit } from '../enums/units.tsx'


export default function Upgrade (props: { token?: string, upgrade: UpgradeInterface }): JSX.Element {
  const { token, upgrade } = props

  async function click (): Promise<void> {
    await UpgradeService.buyUpgrade(token ?? '', { upgradeId: upgrade.id, quantity: 1 })
  }

  useEffect(() => {
  }, [])

  function current (): number {
    let currentUnit: number = upgrade.price_unit
    if (upgrade.amountBought !== 0 && upgrade.amountBought >= 10) {
      currentUnit += Math.floor(upgrade.amountBought / 10) * 3
    }
    return currentUnit
  }

  return (
    <div className={'upgrade prevent-select'}>
      <span>{upgrade.name}</span>
      { upgrade.amount && <span>{Number(upgrade.amount).toFixed(2)}</span>}
      <div>
        <button className={'btn-hover color-4'} onClick={click}>
          <span className={'price'}>{upgrade.price}</span>
          <span className={'unit'}>{calculateUnit(current())}</span>
        </button>
      </div>
    </div>
  )
}
