import type skinInterface from '../interfaces/skin.interface.ts'
import { cars } from '../utils/cars.utils.ts'
import '../assets/styles/Skin.scss'
const Skin = (props: { skin: skinInterface }): JSX.Element => {
  const skin: skinInterface = props.skin

  function click (): void {
    console.log('change skin to: ' + skin.id)
  }

  return (
		<div className={'skin prevent-select'}>
			<img src={cars[skin.id]}/>
			<button className={'btn-hover color-4'} onClick={click}>{skin.price}$</button>
		</div>
  )
}

export default Skin
