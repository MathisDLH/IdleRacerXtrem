import { useEffect } from 'react'
import { cars } from '../utils/cars.utils.ts'
import '../assets/styles/Skin.scss'
import type skinInterface from '../interfaces/skin.interface.ts'
import { eventEmitter } from '../utils/event-emitter.ts'
const Skin = (props: { skin: skinInterface }): JSX.Element => {
  const skin: skinInterface = props.skin

  useEffect(() => {
  }, [])

  function click (): void {
	  eventEmitter.emit('skin', skin.id)
  }

  return (
		<div className={'skin prevent-select'}>
			<img src={cars[skin.id]}/>
			<button className={'btn-hover color-4'} onClick={click}>{skin.price}$</button>
		</div>
  )
}

export default Skin
