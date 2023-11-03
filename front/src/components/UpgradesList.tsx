import { useEffect, useState } from 'react'
import type UpgradeInterface from '../interfaces/upgrade.interface.ts'
import * as UpgradeService from '../services/upgrades.service.ts'
import Upgrade from './Upgrade.tsx'
import { Box, Tab, Tabs } from '@mui/material'
import '../assets/styles/UpgradesList.scss'
import { useAuth } from '../context/Auth.tsx'

export default function UpgradesList (): JSX.Element {
  const [value, setValue] = useState<number>(0)
  const { token } = useAuth()
  const [upgrades, setUpgrades] = useState<UpgradeInterface[]>([])

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
        </Tabs>
      </Box>
      <div className={'upgrades'}>
        <TabPanel value={value} index={0}>
          {upgrades.map((upgrade: UpgradeInterface) => {
            return <Upgrade key={upgrade.id} token={token} upgrade={upgrade}/>
          })}
        </TabPanel>
      </div>
    </div>
  )
}
