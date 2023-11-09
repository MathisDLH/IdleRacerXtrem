import axios from 'axios'
import { type User } from '../interfaces/user.interface'

const API_BASE_URL: any = import.meta.env.VITE_API_URL

export async function createUser (name: string, email: string, password: string): Promise<void> {
  await axios.post(`${API_BASE_URL}/auth/register`, {
    name,
    email,
    password
  })
}

export async function loginUser (name: string, password: string): Promise<any> {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    name,
    password
  })
  return response.data
}

export async function getUser (id: string): Promise<User> {
  const response = await axios.get(`${API_BASE_URL}/user/${id}`)
  console.log(response.data)
  return response.data
}
