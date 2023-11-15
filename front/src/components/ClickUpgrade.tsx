/* eslint-disable @typescript-eslint/indent */
import { useEffect, useState, useCallback, type ChangeEvent } from 'react'
import '../assets/styles/ClickUpgrade.scss'
import steeringWheel from '../assets/images/game/icons/steering_wheel.png'
import React from 'react'

const ClickUpgrade = React.memo((): JSX.Element => {
    const [inputValue, setInputValue] = useState<number>(100)
    const onChangeInput = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
          setInputValue(e.target.valueAsNumber)
        },
        [inputValue]
      )
    useEffect(() => {

    }, [])

    return (
        <div className={'wrapper prevent-select'}>
            <div className='steering-wheel'>
                <img src={steeringWheel} />
            </div>
            <div>
                <span>Actual click value :</span>
                <div>
                    <input type='number' min={100} onChange={ onChangeInput } />
                    <button className={'btn-hover color-4'}>{}$</button>
                </div>
                <span>Next click value :</span>
            </div>
        </div>
    )
})

ClickUpgrade.displayName = 'ClickUpgrade'

export default ClickUpgrade
