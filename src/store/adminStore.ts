import { persistentMap } from '@nanostores/persistent';

export type AdminSettings = {
    isAdminMode: 'true' | 'false';
};

// Create a persistent store for admin mode settings
export const adminStore = persistentMap<AdminSettings>(
    'marketflex_admin:',
    {
        isAdminMode: 'false'
    }
);

// Helper functions for easy access
export const toggleAdminMode = () => {
    const current = adminStore.get().isAdminMode;
    adminStore.setKey('isAdminMode', current === 'true' ? 'false' : 'true');
};

export const setAdminMode = (isMode: boolean) => {
    adminStore.setKey('isAdminMode', isMode ? 'true' : 'false');
};

export const getIsAdminMode = () => {
    return adminStore.get().isAdminMode === 'true';
};
