// Configuration de l'API
export const API_CONFIG = {
  // Remplace par l'URL de ton backend
  BASE_URL: 'https://muka-lept.onrender.com', // ou 'https://ton-api.com'

  // Endpoints
  ENDPOINTS: {
    // Auth
    SIGNUP: '/auth/signup',
    LOGIN: '/security/token',
    ME: '/users/me',

    // Micronutriments
    MICRONUTRIENTS: '/micronutrient',
    PATHOLOGIES: '/pathologies',
    COMPLEMENTS_BY_PATHOLOGY: (pathology: string) => `/complements/${pathology}`,
    COMPLEMENT_BY_NAME: (name: string) => `/complement/${name}`,

    // Scan
    SCAN_PRODUCT: (ean: string) => `/qrcode/${ean}`,
    SCAN_HISTORY: '/qrcode/history',
    ALL_SCANNED: '/scanned',
  },
};

// Helper pour construire les URLs complètes
export const buildUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};