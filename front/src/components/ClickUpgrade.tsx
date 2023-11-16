/* eslint-disable @typescript-eslint/indent */
import { useEffect, useState, useCallback, type ChangeEvent } from 'react'
import '../assets/styles/ClickUpgrade.scss'
import steeringWheel from '../assets/images/game/icons/steering_wheel.png'
import { Units, calculateUnit } from '../enums/units'
import * as UpgradeService from '../services/upgrades.service.ts'
import { useAuth } from '../context/Auth.tsx'
import { eventEmitter } from '../utils/event-emitter.ts'


const ClickUpgrade = (): JSX.Element => {
    const { user } = useAuth()
    const [inputValue, setInputValue] = useState<number>(1)
    const [inputUnit, setInputUnit] = useState<number>(0)
    const [clickEarned, setClickEarned] = useState<number>(1)
    const [clickEarnedUnit, setClickEarnedUnit] = useState<number>(0)
    const [actualClickValue, setActualClickValue] = useState<number>(user?.click ?? 0)
    const [actualClickUnit, setActualClickUnit] = useState<number>(user?.click_unite ?? 0)

    const { token } = useAuth()


    const handleChangeAmount = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(+event.target.value)
    }
    , [])

    const handleChangeUnit = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        setInputUnit(+event.target.value)
    }
    , [])

    useEffect(() => {
        calculateCLickEarned()
    }, [inputValue, inputUnit])

    function calculateCLickEarned (): void {
        let amountOfClick = inputValue / 100
        let unitOfClick = inputUnit
        if (amountOfClick < 1) {
            amountOfClick *= 1000
            unitOfClick -= 3
        }
        if (unitOfClick < 0) {
            unitOfClick = 0
            amountOfClick = 0
        }

        setClickEarned(amountOfClick)
        setClickEarnedUnit(unitOfClick)
    }

    async function click (): Promise<void> {
        const responseData = await UpgradeService.buyClick(token ?? '', { amount: inputValue, unit: inputUnit })
        if (responseData.amount !== 0) {
            setActualClickValue(responseData.amount)
            setActualClickUnit(responseData.unit)
        }
        eventEmitter.emit('buyUpgrade', { inputValue, inputUnit })
      }

    return (
        <div className={'wrapper prevent-select'}>
            <div className='steering-wheel'>
                <img src={steeringWheel} />
            </div>
            <div>
                <span>Upgrade your Click Power !</span><br />
                <span>Actual Click Power : {actualClickValue.toFixed(2)} {calculateUnit(actualClickUnit)}</span>
                <div>
                    <input defaultValue={1} type='number' min={1} max={999} onChange={handleChangeAmount} />
                    <select defaultValue={0} onChange={handleChangeUnit}>
                        {Object.entries(Units).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </select>
                    <span>$</span>
                </div>
                <span>Added click value : {clickEarned} {calculateUnit(clickEarnedUnit)}</span>
                <button onClick={click} className={'btn-hover color-4 buy_btn'}>Buy !</button>

            </div>
        </div>
    )
}

export default ClickUpgrade
