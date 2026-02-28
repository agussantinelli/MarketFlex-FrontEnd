const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5979/api';
const API_BASE_URL = API_URL.replace('/api', '');

/**
 * Normaliza la URL de una imagen de producto.
 * Si la ruta es absoluta (Cloudinary), la devuelve tal cual.
 * Si es relativa (local), le antepone el API_BASE_URL.
 */
export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;

    // Asegurar que empiece con / para que la concatenación sea limpia
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
};
