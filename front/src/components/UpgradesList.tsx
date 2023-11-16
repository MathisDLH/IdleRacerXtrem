import { useEffect, useState } from 'react'
import { Box, Tab } from '@mui/material'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import * as SkinService from '../services/skin.service.ts'
import { cars } from '../utils/cars.utils.ts'
import { useAuth } from '../context/Auth.tsx'
import Skin from './Skin.tsx'
import '../assets/styles/UpgradesList.scss'
import type SkinInterface from '../interfaces/skin.interface.ts'
import ClickUpgrade from './ClickUpgrade.tsx'
import UpgradeTab from './UpgradeTab.tsx'


export default function UpgradesList (): JSX.Element {
  const [value, setValue] = useState<number>(0)
  const { token } = useAuth()
  const [skins, setSkins] = useState<SkinInterface[]>([])

  const handleChange = (_: any, newValue: number): void => {
    console.log(newValue)
    setValue(newValue)
  }

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
    void fetchData()
  }, [])


  return (
  <TabContext value={value.toString()}>
    <div className='upgrades-container'>
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
    <TabList variant="fullWidth" className='upgrades-container' onChange={handleChange}>
      <Tab label="Money" value="0" />
      <Tab label="Click" value="1" />
      <Tab label="Skins" value="2" />
    </TabList>
  </Box>
  <TabPanel value="0"><UpgradeTab/></TabPanel>
  <TabPanel value="1"><ClickUpgrade/></TabPanel>
  <TabPanel value="2">      {skins.map((skin: SkinInterface, index) => {
    return <Skin key={index} skin={skin}/>
  })}</TabPanel>
  </div>
</TabContext>
  )
}
