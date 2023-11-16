import * as UpgradeService from '../services/upgrades.service.ts'
import { calculateUnit } from '../enums/units.tsx'
import { eventEmitter } from '../utils/event-emitter.ts'
import { useEffect, useState, useRef } from 'react'

export default function UpgradeButton (props: { token?: string, price: number, unit: number, upgradeId: number }): JSX.Element {
  const btn = useRef<any>()
  const { token, upgradeId, price, unit } = props
  const [disabled, setDisabled] = useState<boolean>(true)

  async function click (): Promise<void> {
    await UpgradeService.buyUpgrade(token ?? '', { upgradeId, quantity: 1 })
    eventEmitter.emit('buyUpgrade', { price, unit })
  }

  useEffect(() => {
    eventEmitter.on('money', (data: any) => {
      if (data.unit > unit) {
        setDisabled(false)
      } else if (data.unit === unit && data.money >= price) {
        setDisabled(false)
      } else {
        setDisabled(true)
      }
    })
    return () => {
      eventEmitter.off('money')
    }
  }, [[price, unit]])

  useEffect(() => {
    if (disabled) {
      btn.current.className = 'btn-hover color-4 disabled'
    } else {
      btn.current.className = 'btn-hover color-4'
    }
  }, [disabled])

  return (
    <button ref={btn} className={'btn-hover color-4 disabled'} onClick={click} disabled={disabled}>
        <span className={'price'}>{price}</span>
        <span className={'unit'}>{calculateUnit(unit)}</span>
    </button>
  )
}
