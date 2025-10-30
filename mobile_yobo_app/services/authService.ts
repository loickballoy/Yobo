import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, buildUrl } from '../config/api';

// Types
interface SignupData {
    email: string;
    password: string;
    full_name: string;
}

interface LoginData {
    username: string; // L'API utilise 'username' mais c'est l'email
    password: string;
}

interface AuthResponse {
    access_token: string;
    token_type: string;
}

// Service d'authentification
export const authService = {
    // Inscription
    signup: async (data: SignupData) => {
        try {
            const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.SIGNUP), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Erreur lors de l\'inscription');
            }

            const result = await response.json();

            // Sauvegarder le token
            if (result.JWTtoken) {
                await AsyncStorage.setItem('access_token', result.JWTtoken);
            }

            return result;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    },

    // Connexion
    login: async (email: string, password: string) => {
        try {
            // L'API utilise OAuth2 avec form-data
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.LOGIN), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Email ou mot de passe incorrect');
            }

            const data: AuthResponse = await response.json();

            // Sauvegarder le token
            await AsyncStorage.setItem('access_token', data.access_token);

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Récupérer l'utilisateur connecté
    getCurrentUser: async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');

            if (!token) {
                throw new Error('Aucun token trouvé');
            }

            const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.ME), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Token invalide');
            }

            return await response.json();
        } catch (error) {
            console.error('Get current user error:', error);
            throw error;
        }
    },

    // Déconnexion
    logout: async () => {
        try {
            await AsyncStorage.removeItem('access_token');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    // Vérifier si l'utilisateur est connecté
    isAuthenticated: async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            return !!token;
        } catch (error) {
            return false;
        }
    },

    // Récupérer le token
    getToken: async () => {
        return await AsyncStorage.getItem('access_token');
    },
};