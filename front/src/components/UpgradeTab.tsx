import Upgrade from './Upgrade.tsx'
import { useState, useEffect } from 'react'
import type UpgradeInterface from '../interfaces/upgrade.interface.ts'
import { useWebSocket } from '../context/Socket.tsx'
import * as UpgradeService from '../services/upgrades.service.ts'
import { useAuth } from '../context/Auth.tsx'


export interface UpgradeEvent {
  realTimeData: any
  upgrades: UpgradeInterface[]
}

export default function UpgradeTab (): JSX.Element {
  const [upgrades, setUpgrades] = useState<UpgradeInterface[]>([])
  const [upgradeEvent, setUpgradeEvent] = useState<UpgradeEvent>()
  const [allUpgradeFromDb, setAllUpgradeFromDb] = useState<UpgradeInterface[]>([])
  const { socket } = useWebSocket()
  const { token } = useAuth()

  useEffect(() => {
    console.log('refresh')
    const fetchData = async (): Promise<void> => {
      const allUpgrades = await UpgradeService.getUpgrades(token ?? '')
      setAllUpgradeFromDb(allUpgrades)
    }

    fetchData()
    socket.on('upgrades', (event: UpgradeEvent) => {
      setUpgradeEvent(event)
    })

    return () => {
      socket.off('upgrades')
    }
  }, [])

  useEffect(() => {
    const ownedUpgrade = upgradeEvent?.upgrades ?? []
    const d = allUpgradeFromDb.filter(upgrade => (ownedUpgrade.some(u => +u.id === upgrade.id) || ownedUpgrade.some(u => +u.id + 1 === upgrade.id) || upgrade.id === 1))
    const dub = d.map(d => {
      const own: UpgradeInterface | undefined = ownedUpgrade.find(o => +o.id === d.id)
      if (own) {
        return { ...d, ...own }
      } else {
        return d
      }
    })
    setUpgrades(dub)
  }, [upgradeEvent])


  return (
    <div>
        {upgrades.map((upgrade: any) =>
             <Upgrade key={upgrade.id} token={token ?? ''} upgrade={upgrade}/>
        )}
    </div>
  )
}
