import { persistentMap } from '@nanostores/persistent';

export type ManagementSettings = {
    isManagementMode: 'true' | 'false';
};

// Create a persistent store for admin mode settings
export const managementStore = persistentMap<ManagementSettings>(
    'marketflex_management:',
    {
        isManagementMode: 'false'
    }
);

// Helper functions for easy access
export const toggleManagementMode = () => {
    const current = managementStore.get().isManagementMode;
    managementStore.setKey('isManagementMode', current === 'true' ? 'false' : 'true');
};

export const setManagementMode = (isMode: boolean) => {
    managementStore.setKey('isManagementMode', isMode ? 'true' : 'false');
};

export const getIsManagementMode = () => {
    return managementStore.get().isManagementMode === 'true';
};

