import { clearCart } from '../store/cartStore';
import { persistentAtom } from '@nanostores/persistent';

export const lastSeedVersion = persistentAtom<string | undefined>('marketflex_last_seed', undefined);

export const checkDataVersion = async () => {
    try {
        const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/health`);
        if (!response.ok) return;

        const data = await response.json();
        const serverSeed = data.lastSeed;
        const localSeed = lastSeedVersion.get();

        if (serverSeed && serverSeed !== localSeed) {
            console.log('🔄 Detectado cambio en base de datos. Limpiando cache local...');
            clearCart();
            // Limpiar otros estados persistentes si existen
            lastSeedVersion.set(serverSeed);
        }
    } catch (error) {
        console.error('Error verificando versión de datos:', error);
    }
};
