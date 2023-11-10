import '../assets/styles/Car.scss'
import { cars } from '../utils/cars.utils'

interface Props {
  skinId: number
  playerName: string
}

const Car = ({ playerName }: Props): JSX.Element => {
  return (
    <div className="car-container">
        <img id="car" src={cars[0].path} alt={playerName} />
        <p>{playerName}</p>
    </div>
  )
}

export default Car
