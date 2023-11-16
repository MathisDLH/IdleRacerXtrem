import { calculateUnitWithoutDollar } from '../enums/units.tsx'


export default function UpgradeCount (props: { amount: number, unit: number }): JSX.Element {
  const { amount, unit } = props


  return (
        <div>
            { amount && <span>{Number(amount).toFixed(2)} {calculateUnitWithoutDollar(unit)}</span> }
        </div>
  )
}
