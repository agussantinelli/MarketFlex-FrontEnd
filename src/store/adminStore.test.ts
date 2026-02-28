import { describe, it, expect, beforeEach } from 'vitest';
import { adminStore, toggleAdminMode, setAdminMode, getIsAdminMode } from './adminStore';

describe('adminStore', () => {
    beforeEach(() => {
        // Reset the store to default value before each test
        adminStore.setKey('isAdminMode', 'false');
    });

    it('should have isAdminMode false by default', () => {
        expect(getIsAdminMode()).toBe(false);
    });

    it('should update the store when setAdminMode is called with true', () => {
        setAdminMode(true);
        expect(getIsAdminMode()).toBe(true);
        expect(adminStore.get().isAdminMode).toBe('true');
    });

    it('should update the store when setAdminMode is called with false', () => {
        setAdminMode(true); // Set to true first
        setAdminMode(false);
        expect(getIsAdminMode()).toBe(false);
        expect(adminStore.get().isAdminMode).toBe('false');
    });

    it('should toggle the state correctly when toggleAdminMode is called', () => {
        expect(getIsAdminMode()).toBe(false); // Initial state

        toggleAdminMode();
        expect(getIsAdminMode()).toBe(true);

        toggleAdminMode();
        expect(getIsAdminMode()).toBe(false);
    });
});
