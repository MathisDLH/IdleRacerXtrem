import axios from 'axios';
import { User } from '../interfaces/user.interface';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function createUser(email: string, password: string) {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/register`, {
            email: email,
            password: password
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function loginUser(email: string, password: string) {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: email,
            password: password
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function getUser(id: string): Promise<User> {
    try {
        const response = await axios.get(`${API_BASE_URL}/users/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
