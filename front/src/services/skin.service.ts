import axios, {AxiosResponse } from 'axios'
import type SkinInterface from '../interfaces/skin.interface.ts'

const API_BASE_URL: any = import.meta.env.VITE_API_URL

export async function getSkins (token: string): Promise<SkinInterface[]> {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const response = await axios.get(
      `${API_BASE_URL}/skin`,
      config
    )
    return response.data
  } catch (error) {
    return []
  }
}

export async function buyUpgrade (token: string, name: string): Promise<AxiosResponse<any, any>> {
  const config = {
    headers: {Authorization: `Bearer ${token}` }
  }
  return await axios.get(
      `${API_BASE_URL}/skin/${name}/purchase`,
      config
  )
}
