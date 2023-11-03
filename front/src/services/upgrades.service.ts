import axios from 'axios'
import type UpgradeInterface from '../interfaces/upgrade.interface.ts'

const API_BASE_URL: any = import.meta.env.VITE_API_URL

export async function getUpgrades (token: string): Promise<UpgradeInterface[]> {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const response = await axios.get(
      `${API_BASE_URL}/upgrades`,
      config
    )
    console.log(response.data)
    return response.data
  } catch (error) {
    return []
  }
}

export async function buyUpgrade (token: string, body: { id: number, quantity: number }): Promise<void> {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const response = await axios.post(
      `${API_BASE_URL}/buyUpgrade`,
      body,
      config
    )
    console.log(response.data)
  } catch (error) {
    console.log(error)
  }
}
