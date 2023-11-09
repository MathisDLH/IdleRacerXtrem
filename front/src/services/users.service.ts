import axios from 'axios'
import { type User } from '../interfaces/user.interface'

const API_BASE_URL: any = import.meta.env.VITE_API_URL

export const getScores = async (): Promise<User[]> => {
  const scores: any = await axios.get(`${API_BASE_URL}/users/scores`)

  const score: User[] = scores.data

  return score
}
