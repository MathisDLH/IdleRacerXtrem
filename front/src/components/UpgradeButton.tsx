import * as UpgradeService from '../services/upgrades.service.ts'
import { calculateUnit } from '../enums/units.tsx'
import { useEffect, useState } from 'react'

export default function UpgradeButton (props: { token?: string, basicPrice: number, unit: number, upgradeId: number, amountBought: number }): JSX.Element {
  const { token, basicPrice, unit, upgradeId, amountBought } = props
  const [price, setPrice] = useState<number>(0)
  const [priceUnit, setPriceUnit] = useState<number>(0)

  useEffect(() => {
    let currentUnit: number = unit
    let currentPrice = basicPrice
    const multiplier = amountBought >= 10 ? Math.floor(amountBought / 10) * 2 : 0
    currentPrice *= Math.pow(10, multiplier)

    while (currentPrice >= 1000) {
      currentPrice /= 1000
      currentUnit += 3
    }
    setPrice(currentPrice)
    setPriceUnit(currentUnit)
  }, [])

  async function click (): Promise<void> {
    await UpgradeService.buyUpgrade(token ?? '', { upgradeId, quantity: 1 })
  }

  return (
    <button className={'btn-hover color-4'} onClick={click}>
        <span className={'price'}>{price}</span>
        <span className={'unit'}>{calculateUnit(priceUnit)}</span>
    </button>
  )
}
