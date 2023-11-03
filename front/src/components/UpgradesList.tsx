import { useEffect, useState } from 'react'
import type UpgradeInterface from '../interfaces/upgrade.interface.ts'
import * as UpgradeService from '../services/upgrades.service.ts'
import Upgrade from './Upgrade.tsx'
import { Box, Tab, Tabs, Typography } from '@mui/material'
import '../assets/styles/UpgradesList.scss'
import { useAuth } from '../context/Auth.tsx'
import {renderToReadableStream} from "react-dom/server";

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
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    )
  }

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const data = await UpgradeService.getUpgrades(token || '')
      setUpgrades(data)
    }
    fetchData()
  }, [])

  return (
    <div id={'list'} className={'upgrades'}>
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
      <TabPanel value={value} index={0}>
        {upgrades.map((upgrade: UpgradeInterface) => {
          return <Upgrade key={upgrade.id} {...upgrade}/>
        })}
      </TabPanel>
    </div>
  )
}
