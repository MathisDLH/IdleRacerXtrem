import { useEffect, useState } from 'react'
import { Box, Tab, Tabs } from '@mui/material'

import type UpgradeInterface from '../interfaces/upgrade.interface.ts'
import type skinInterface from '../interfaces/skin.interface.ts'

import * as UpgradeService from '../services/upgrades.service.ts'

import { cars } from '../utils/cars.utils.ts'

import { useAuth } from '../context/Auth.tsx'
import Upgrade from './Upgrade.tsx'
import Skin from './Skin.tsx'

import '../assets/styles/UpgradesList.scss'

export default function UpgradesList (): JSX.Element {
  const [value, setValue] = useState<number>(0)
  const { token } = useAuth()
  const [upgrades, setUpgrades] = useState<UpgradeInterface[]>([])
  const [skins, setSkins] = useState<skinInterface[]>([])

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
    const fetchData = async (): Promise<void> => {
      const data = await UpgradeService.getUpgrades(token ?? '')
      setUpgrades(data)
      if (data.length === 0) {
        setUpgrades([
          {
            id: 0,
            name: 'mock',
            price: 0,
            price_unit: 'UNIT',
            ratio: 1,
            generationUpgradeId: 0,
            value: 0,
            imagePath: 'mock-upgrade.png'
          }
        ])
      }
    }
    fetchData()
  }, [])

  /**
   * Get skins
   */
  useEffect(() => {
    cars.map((car): void => {
      const id = parseInt(car.split('.png')[0].split('cars/')[1]) - 1
      const availables = skins
      availables.push({
        id: id,
        price: id * 100
      })
      setSkins(availables)
    })
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
          <Tab label={'Races'}/>
          <Tab label={'Skins'}/>
        </Tabs>
      </Box>
      <div className={'upgrades'}>
        <TabPanel value={value} index={0}>
          {upgrades.map((upgrade: UpgradeInterface) => {
            return <Upgrade key={upgrade.id} token={token ?? ''} upgrade={upgrade}/>
          })}
        </TabPanel>
        <TabPanel value={value} index={2}>
          {skins.map((skin: skinInterface) => {
            return <Skin key={skin.id} skin={skin}/>
          })}
        </TabPanel>
      </div>
    </div>
  )
}
