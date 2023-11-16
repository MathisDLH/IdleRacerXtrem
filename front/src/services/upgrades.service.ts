import axios from 'axios'
import type UpgradeInterface from '../interfaces/upgrade.interface.ts'

const API_BASE_URL: any = import.meta.env.VITE_API_URL

export async function getUpgrades (token: string): Promise<UpgradeInterface[]> {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const response = await axios.get(
      `${API_BASE_URL}/upgrade`,
      config
    )
    return response.data
  } catch (error) {
    return []
  }
}

export async function buyUpgrade (token: string, body: { upgradeId: number, quantity: number }): Promise<void> {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const response = await axios.post(
      `${API_BASE_URL}/upgrade/buyUpgrade`,
      body,
      config
    )
    console.log(response.data)
  } catch (error) {
    console.log(error)
  }
}

export async function buyClick (token: string, body: { amount: number, unit: number }): Promise<{ amount: number, unit: number }> {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const response = await axios.post(
      `${API_BASE_URL}/upgrade/buyClick`,
      body,
      config
    )
    return (response.data)
  } catch (error) {
    return { amount: 0, unit: 0 }
  }
}
