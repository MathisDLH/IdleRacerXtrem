import axios from 'axios'
import type UpgradeInterface from '../interfaces/upgrade.interface.ts'

const API_BASE_URL: any = import.meta.env.VITE_API_URL

export async function getUpgrades (token: string): Promise<UpgradeInterface[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/upgrades?token=${token}`)
    console.log(response.data)
    return response.data
  } catch (error) {
    return []
  }
}
