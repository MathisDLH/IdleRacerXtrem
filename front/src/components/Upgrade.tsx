import '../assets/styles/Upgrade.scss'
import GameButton from './GameButton.tsx'
import { type UpgradeInterface } from '../interfaces/upgrade.interface.ts'

export default function Upgrade (upgrade: UpgradeInterface): JSX.Element {
  function click (): void {

  }

  return (
    <div className={'upgrade prevent-select'}>
      <span>{upgrade.name}</span>
      <GameButton color={'green'} text={upgrade.price + '$'} click={click}></GameButton>
    </div>
  )
}
