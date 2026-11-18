export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://emsapi.aitamsac.in').replace(/\/+$/, '');
// Helper to build an absolute API endpoint URL
export function apiUrl(path = '') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
export default apiUrl;
