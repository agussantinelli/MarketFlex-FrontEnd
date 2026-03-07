import { describe, it, expect, beforeEach } from 'vitest';
import { managementStore, toggleManagementMode, setManagementMode, getIsManagementMode } from './managementStore';

describe('managementStore', () => {
    beforeEach(() => {
        // Reset the store to default value before each test
        managementStore.setKey('isManagementMode', 'false');
    });

    it('should have isManagementMode false by default', () => {
        expect(getIsManagementMode()).toBe(false);
    });

    it('should update the store when setManagementMode is called with true', () => {
        setManagementMode(true);
        expect(getIsManagementMode()).toBe(true);
        expect(managementStore.get().isManagementMode).toBe('true');
    });

    it('should update the store when setManagementMode is called with false', () => {
        setManagementMode(true); // Set to true first
        setManagementMode(false);
        expect(getIsManagementMode()).toBe(false);
        expect(managementStore.get().isManagementMode).toBe('false');
    });

    it('should toggle the state correctly when toggleManagementMode is called', () => {
        expect(getIsManagementMode()).toBe(false); // Initial state

        toggleManagementMode();
        expect(getIsManagementMode()).toBe(true);

        toggleManagementMode();
        expect(getIsManagementMode()).toBe(false);
    });
});

