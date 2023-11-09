import '../assets/styles/Upgrade.scss'
import '../assets/styles/LuxuryButtons.scss'
import type UpgradeInterface from '../interfaces/upgrade.interface.ts'
import * as UpgradeService from '../services/upgrades.service.ts'
import { useEffect } from 'react'

export default function Upgrade (props: { token?: string, upgrade: UpgradeInterface }): JSX.Element {
  const { token, upgrade } = props
  async function click (): Promise<void> {
    await UpgradeService.buyUpgrade(token ?? '', { upgrade_id: upgrade.id, quantity: 1 })
  }

  useEffect(() => {
  }, [])

  function calculatePrice (): string {
    switch (upgrade.price_unit) {
      case 'UNIT':
        return `${upgrade.price}$`
      case 'MILLION':
        return `${upgrade.price} M $`
      case 'BILLION':
        return `${upgrade.price} B $`
      case 'TRILLION':
        return `${upgrade.price} T $`
      case 'QUADRILLION':
        return `${upgrade.price} Q $`
      case 'QUINTILLION':
        return `${upgrade.price} Qi $`
      case 'SEXTILLION':
        return `${upgrade.price} S $`
      case 'SEPTILLION':
        return `${upgrade.price} Sp $`
      case 'OCTILLION':
        return `${upgrade.price} O $`
      case 'NONILLION':
        return `${upgrade.price} N $`
      case 'DECILLION':
        return `${upgrade.price} D $`
      default:
        return 'ERROR'
    }
  }

  return (
    <div className={'upgrade prevent-select'}>
      <span>{upgrade.name}</span>
      <div>
        <button className={'btn-hover color-4'} onClick={click}>{calculatePrice()}</button>
      </div>
    </div>
  )
}
