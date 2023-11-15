import { useEffect, useState } from 'react'
import { Box, Tab, Tabs } from '@mui/material'

import type UpgradeInterface from '../interfaces/upgrade.interface.ts'

import * as UpgradeService from '../services/upgrades.service.ts'
import * as SkinService from '../services/skin.service.ts'

import { cars } from '../utils/cars.utils.ts'

import { useAuth } from '../context/Auth.tsx'
import Upgrade from './Upgrade.tsx'
import Skin from './Skin.tsx'

import '../assets/styles/UpgradesList.scss'
import type SkinInterface from '../interfaces/skin.interface.ts'
import { useWebSocket } from '../context/Socket.tsx'
import ClickUpgrade from './ClickUpgrade.tsx'

export interface UpgradeEvent {
  realTimeData: any
  upgrades: UpgradeInterface[]
}


export default function UpgradesList (): JSX.Element {
  const [value, setValue] = useState<number>(0)
  const { token } = useAuth()
  const [upgradeEvent, setUpgradeEvent] = useState<UpgradeEvent>()
  const [upgrades, setUpgrades] = useState<UpgradeInterface[]>([])
  const [allUpgradeFromDb, setAllUpgradeFromDb] = useState<UpgradeInterface[]>([])
  const [skins, setSkins] = useState<SkinInterface[]>([])
  const { socket } = useWebSocket()

  const handleChange = (_: any, newValue: number): void => {
    console.log(newValue)
    setValue(newValue)
  }

  interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
  }

  function TabPanel (props: TabPanelProps): JSX.Element {
    const { children, value, index, ...other } = props
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    )
  }

  /**
   * Fetch upgrades from API
   */
  useEffect(() => {
    const fetchData = async () => {
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

    const d = allUpgradeFromDb.filter(upgrade => ownedUpgrade.some(u => +u.id === upgrade.id) || ownedUpgrade.some(u => +u.id + 1 === upgrade.id))
    const dub = d.map(d => {
      const own: UpgradeInterface | undefined = ownedUpgrade.find(o => +o.id === d.id)
      if (own) {
        return { ...d, ...own }
      } else {
        return d
      }
    })

    // const d = ownedUpgrade.filter(ownedUpgrade => allUpgradesId.includes(+ownedUpgrade.id) || allUpgradesId.includes(+ownedUpgrade.id+1))
    setUpgrades(dub)
  }, [upgradeEvent])

  /**
   * Get skins
   */
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      let skinList = await SkinService.getSkins(token ?? '')
      skinList = skinList.map(skin => {
        const car = cars.find(car => car.name === skin.name)
        return { ...skin, path: car?.path }
      })
      setSkins(skinList)
    }
    fetchData()
  }, [])

  return (
    <div id={'list'} className={'upgrades-container'}>
      <Box>
        <Tabs value={value}
          onChange={handleChange}
          indicatorColor={'primary'}
          variant="fullWidth"
        >
          <Tab label={'Money'}/>
          <Tab label={'Click'}/>
          <Tab label={'Races'}/>
          <Tab label={'Skins'}/>
        </Tabs>
      </Box>
      <div className={'upgrades'}>
        <TabPanel value={value} index={0}>
          {upgrades.map((upgrade: any) =>
             <Upgrade key={upgrade.id} token={token ?? ''} upgrade={upgrade}/>
          )}
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ClickUpgrade/>
        </TabPanel>
        <TabPanel value={value} index={3}>
          {skins.map((skin: SkinInterface, index) => {
            return <Skin key={index} skin={skin}/>
          })}
        </TabPanel>
      </div>
    </div>
  )
}
