import { useEffect, useRef, useState } from 'react'
import '../assets/styles/Skin.scss'
import type skinInterface from '../interfaces/skin.interface.ts'
import { eventEmitter } from '../utils/event-emitter.ts'
import { calculateUnit } from '../enums/units.tsx'
import * as SkinService from '../services/skin.service.ts'
import { useAuth } from '../context/Auth.tsx'

const Skin = (props: { skin: skinInterface }): JSX.Element => {
  const skin: skinInterface = props.skin
  const { token, user } = useAuth()
  const btn = useRef<any>()
  const [disabled, setDisabled] = useState<boolean>(false)

  useEffect(() => {
    eventEmitter.on('money', (data: any) => {
      if (skin.priceUnit && skin.price) {
        if (data.unit > skin.priceUnit) {
          setDisabled(false)
        } else if (data.unit === skin.priceUnit && data.money >= skin.price) {
          setDisabled(false)
        } else {
          setDisabled(true)
        }
      }
    })
    return () => {
      eventEmitter.off('money')
    }
  }, [])

  useEffect(() => {
    if (btn?.current) {
      if (disabled) {
        btn.current.className = 'btn-hover color-4 disabled'
      } else {
        btn.current.className = 'btn-hover color-4'
      }
    }
  }, [disabled])

  function click (): void {
    if (isOwned()) {
      eventEmitter.emit('skin', skin)
    } else {
      SkinService.buyUpgrade(token ?? '', skin.name).then((response) => {
        if (response.status === 200) {
          eventEmitter.emit('skin', skin)
        }
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
      {isOwned()
        ? <button className={'btn-hover color-4'} onClick={click}>OWNED</button>
        : <button ref={btn} className={'btn-hover color-4 disabled'} onClick={click} disabled={disabled}>{skin.price} {calculateUnit(skin.priceUnit ?? 0)}</button>}
    </div>
  )
}

export default Skin
