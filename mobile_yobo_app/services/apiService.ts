import { API_CONFIG, buildUrl } from '../config/api';
import { authService } from './authService';

// Helper pour les requêtes authentifiées
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = await authService.getToken();

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Erreur inconnue' }));
        throw new Error(error.detail || 'Erreur lors de la requête');
    }

    return response.json();
};

// Service API
export const apiService = {
    // Pathologies
    getPathologies: async () => {
        return fetch(buildUrl(API_CONFIG.ENDPOINTS.PATHOLOGIES))
            .then(res => res.json());
    },

    // Compléments par pathologie
    getComplementsByPathology: async (pathology: string) => {
        return fetch(buildUrl(API_CONFIG.ENDPOINTS.COMPLEMENTS_BY_PATHOLOGY(pathology)))
            .then(res => res.json());
    },

    // Détails d'un complément
    getComplementDetails: async (name: string) => {
        return fetch(buildUrl(API_CONFIG.ENDPOINTS.COMPLEMENT_BY_NAME(name)))
            .then(res => res.json());
    },

    // Scanner un produit (nécessite authentification)
    scanProduct: async (ean: string) => {
        return fetchWithAuth(buildUrl(API_CONFIG.ENDPOINTS.SCAN_PRODUCT(ean)));
    },

    // Historique des scans (nécessite authentification)
    getScanHistory: async () => {
        return fetchWithAuth(buildUrl(API_CONFIG.ENDPOINTS.SCAN_HISTORY));
    },

    // Tous les produits scannés
    getAllScannedProducts: async () => {
        return fetch(buildUrl(API_CONFIG.ENDPOINTS.ALL_SCANNED))
            .then(res => res.json());
    },

    // Tous les micronutriments
    getAllMicronutrients: async () => {
        return fetch(buildUrl(API_CONFIG.ENDPOINTS.MICRONUTRIENTS))
            .then(res => res.json());
    },
};