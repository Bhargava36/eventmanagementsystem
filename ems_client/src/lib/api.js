export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
// Helper to build an absolute API endpoint URL
export function apiUrl(path = '') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
export default apiUrl;
