import { useEffect } from 'react'
import '../assets/styles/Skin.scss'
import type skinInterface from '../interfaces/skin.interface.ts'
import { eventEmitter } from '../utils/event-emitter.ts'
import { calculateUnit } from '../enums/units.tsx'
import * as SkinService from '../services/skin.service.ts'
import { useAuth } from '../context/Auth.tsx'

const Skin = (props: { skin: skinInterface }): JSX.Element => {
  const skin: skinInterface = props.skin
  const { token, user } = useAuth()

  useEffect(() => {
  }, [])

  function click (): void {
    if (isOwned()) {
      eventEmitter.emit('skin', skin)
    } else {
      SkinService.buyUpgrade(token ?? '', skin.name).then(() => {
        eventEmitter.emit('skin', skin)
        if (user) {
          user.ownedSkins = [...user.ownedSkins, skin.name]
        }
      }).catch((err) => { console.error(err) })
    }
  }


  const isOwned = (): boolean => {
    return user?.ownedSkins.includes(skin.name) ?? false
  }

  return (
		<div className={'skin prevent-select'}>
			<img src={skin.path}/>
            {isOwned() ? <button className={'btn-hover color-4'} onClick={click}>OWNED</button> : <button className={'btn-hover color-4'} onClick={click}>{skin.price} {calculateUnit(skin.priceUnit ?? 0)} </button>}
		</div>
  )
}

export default Skin
