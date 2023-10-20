import blue from '../assets/images/game/icons/buttons-background/blue.png'
import green from '../assets/images/game/icons/buttons-background/green.png'
import red from '../assets/images/game/icons/buttons-background/red.png'
import yellow from '../assets/images/game/icons/buttons-background/yellow.png'
import pink from '../assets/images/game/icons/buttons-background/pink.png'
import purple from '../assets/images/game/icons/buttons-background/purple.png'
import green_blue from '../assets/images/game/icons/buttons-background/green-blue.png'
import orange from '../assets/images/game/icons/buttons-background/orange.png'
import yellow_green from '../assets/images/game/icons/buttons-background/yellow-green.png'
import { useState } from 'react'
import '../assets/styles/GameButton.scss'

export default function GameButton (props: any): JSX.Element {
  const {
    text,
    color,
    click
  } = props

  function loadButton (color: string): string {
    switch (color) {
      case 'blue':
        return blue
      case 'green':
        return green
      case 'red':
        return red
      case 'yellow':
        return yellow
      case 'pink':
        return pink
      case 'purple':
        return purple
      case 'green-blue':
        return green_blue
      case 'orange':
        return orange
      case 'yellow-green':
        return yellow_green
      default:
        return blue
    }
  }

  const [button] = useState(loadButton(color))

  return (
        <div className={'game-button'} onClick={click()}
             style = {{
               backgroundImage: 'url(' + button + ')',
               backgroundSize: 'contain',
               backgroundPosition: 'center'
             }}
        >
            <div>
                <span>{text}</span>
            </div>
        </div>
  )
}
