import axios from 'axios'
import { type User } from '../interfaces/user.interface'

const API_BASE_URL = import.meta.env.VITE_API_URL

export async function createUser (email: string, password: string): Promise<User> {
  const response = await axios.post(`${API_BASE_URL}/users/register`, {
    email,
    password
  })
  return response.data
}

export async function loginUser (email: string, password: string): Promise<User> {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password
  })
  return response.data
}

export async function getUser (id: string): Promise<User> {
  const response = await axios.get(`${API_BASE_URL}/users/${id}`)
  return response.data
}
