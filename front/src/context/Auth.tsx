// Auth.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../interfaces/user.interface';
import * as userService from '../services/auth.service';
import jwt_decode from "jwt-decode";

const AuthContext = createContext({
    user: null as User | null,
    isLoggedIn: false,
    signIn: async (_email: string, _password: string) => { },
    signout: () => { },
    register: async (_email: string, _password: string) => { },
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = (props: any) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if the user is logged in when the component mounts
        const token = localStorage.getItem('access_token');
        console.log(token)
        if (token) {
            const decoded: any = jwt_decode(token);
            userService.getUser(decoded.userId)
                .then((user: User) => {
                    setUser(user);
                    setIsLoggedIn(true);
                })
                .catch((error) => {
                    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
                });
        }
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const promiseToken = await userService.loginUser(email, password);
            const token = promiseToken.access_token;
            if (token) {
                const decoded: any = jwt_decode(token);
                const user: User = await userService.getUser(decoded.userId);
                setUser(user);
                setIsLoggedIn(true);
                localStorage.setItem('access_token', JSON.stringify(token));
            } else {
                console.error('Token d\'accès non valide.');
            }
        } catch (error) {
            console.error('Erreur lors de la connexion de l\'utilisateur:', error);
        }
    }

    const register = async (email: string, password: string) => {
        const data = await userService.createUser(email, password);
        return data;
    }

    const signout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('access_token');
    }

    const value = {
        user,
        isLoggedIn,
        signIn,
        signout,
        register,
    }

    return (
        <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
    )
}
