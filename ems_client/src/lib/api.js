export const API_BASE_URL = (import.meta.env.VITE_API_URL || `${API_BASE_URL}`).replace(/\/+$/, '');

/**
 * Helper to build an absolute API endpoint URL
 * @param {string} path - e.g. '/api/events' or 'api/events'
 * @returns {string} full URL e.g. `${API_BASE_URL}/api/events`
 */
export function apiUrl(path = '') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export default apiUrl;
