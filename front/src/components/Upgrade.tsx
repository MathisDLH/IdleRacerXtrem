import '../assets/styles/Upgrade.scss'
import '../assets/styles/LuxuryButtons.scss'
import type UpgradeInterface from '../interfaces/upgrade.interface.ts'
import { useEffect } from 'react'

export default function Upgrade (upgrade: UpgradeInterface): JSX.Element {
  function click (): void {

  }

  useEffect(() => {
    console.log(upgrade)
  }, [])

  return (
    <div className={'upgrade prevent-select'}>
      <span>{upgrade.name}</span>
      <button className={'btn-hover color-4'} onClick={click}>{upgrade.price}$</button>
    </div>
  )
}
