import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

// Types
interface User {
    email: string;
    full_name?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, fullName: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

// Créer le Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider (enveloppe toute l'app)
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Au démarrage de l'app, vérifier si l'utilisateur est connecté
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const isAuth = await authService.isAuthenticated();

            if (isAuth) {
                const userData = await authService.getCurrentUser();
                setUser(userData);
            }
        } catch (error) {
            console.error('Erreur de vérification auth:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            await authService.login(email, password);
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            throw error;
        }
    };

    const signup = async (email: string, password: string, fullName: string) => {
        try {
            await authService.signup({
                email,
                password,
                full_name: fullName,
            });
            await authService.login(email, password);
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
        } catch (error) {
            throw error;
        }
    };

    const refreshUser = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            setUser(null);
        }
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personnalisé pour utiliser le Context facilement
export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }

    return context;
}