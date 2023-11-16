export const Units: Record<number, string> = {
  0: '',
  3: 'K',
  6: 'M',
  9: 'B',
  12: 'T',
  15: 'Qa',
  18: 'Qi',
  21: 'Sx',
  24: 'Sp',
  27: 'Oc',
  30: 'No',
  33: 'De',
  36: 'Ud',
  39: 'Dd',
  42: 'Td',
  45: 'Qad',
  48: 'Qid',
  51: 'Sxd',
  54: 'Spd',
  57: 'Ocd',
  60: 'Nod',
  63: 'Vg',
  66: 'Uvg',
  69: 'Dvg',
  72: 'Tvg',
  75: 'Qavg',
  78: 'Qivg',
  81: 'Sxvg',
  84: 'Spvg',
  87: 'Ocvg',
  90: 'Novg',
  93: 'Tg',
  96: 'Utg',
  99: 'Dtg',
  102: 'Ttg',
  105: 'Qatg',
  108: 'Qitg',
  111: 'Sxtg'
}

export function calculateUnit (priceUnit: number): string {
  const unit = Units[priceUnit]
  switch (priceUnit) {
    case 0:
      return '$'
    default:
      return ` ${unit} $`
  }
}

export function calculateUnitBySec (priceUnit: number): string {
  const unit = Units[priceUnit]
  switch (priceUnit) {
    case 0:
      return '$'
    default:
      return ` ${unit} /s`
  }
}

export function calculateUnitWithoutDollar (priceUnit: number): string {
  const unit = Units[priceUnit]
  switch (priceUnit) {
    case 0:
      return '$'
    default:
      return ` ${unit}`
  }
}
