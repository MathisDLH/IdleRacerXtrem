import * as UpgradeService from '../services/upgrades.service.ts'
import { calculateUnit } from '../enums/units.tsx'
import { eventEmitter } from '../utils/event-emitter.ts'

export default function UpgradeButton (props: { token?: string, price: number, unit: number, upgradeId: number }): JSX.Element {
  const { token, upgradeId, price, unit } = props

  async function click (): Promise<void> {
    await UpgradeService.buyUpgrade(token ?? '', { upgradeId, quantity: 1 })
    eventEmitter.emit('buyUpgrade', { price, unit })
  }

  return (
    <button className={'btn-hover color-4'} onClick={click}>
        <span className={'price'}>{price}</span>
        <span className={'unit'}>{calculateUnit(unit)}</span>
    </button>
  )
}
