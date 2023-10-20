import '../assets/styles/Upgrade.scss'
import { type UpgradeModel } from '../models/Upgrade.tsx'
import GameButton from './GameButton.tsx'

export default function Upgrade (upgrade: UpgradeModel): JSX.Element {
  function click (): void {

  }

  return (
    <div className={'upgrade prevent-select'}>
      <span>{upgrade.name}</span>
      <GameButton color={'green'} text={upgrade.price + '$'} click={click}></GameButton>
    </div>
  )
}
