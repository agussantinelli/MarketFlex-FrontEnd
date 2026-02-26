import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkDataVersion, lastSeedVersion } from './dataReset';
import * as cartStore from '../store/cartStore';

vi.mock('../store/cartStore', () => ({
    clearCart: vi.fn()
}));

describe('Data Reset Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        lastSeedVersion.set(undefined);
    });

    it('should do nothing if fetch fails', async () => {
        (global.fetch as any).mockResolvedValue({ ok: false });
        await checkDataVersion();
        expect(cartStore.clearCart).not.toHaveBeenCalled();
    });

    it('should set lastSeedVersion if it is undefined (first load)', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({ lastSeed: 'v123' })
        });

        await checkDataVersion();

        expect(lastSeedVersion.get()).toBe('v123');
        expect(cartStore.clearCart).toHaveBeenCalled(); // Triggers on initial set if not present
    });

    it('should clear cart and update version if seeds mismatch', async () => {
        lastSeedVersion.set('v100');

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({ lastSeed: 'v200' })
        });

        await checkDataVersion();

        expect(lastSeedVersion.get()).toBe('v200');
        expect(cartStore.clearCart).toHaveBeenCalled();
    });

    it('should do nothing if seeds match', async () => {
        lastSeedVersion.set('v100');

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({ lastSeed: 'v100' })
        });

        await checkDataVersion();

        expect(lastSeedVersion.get()).toBe('v100');
        expect(cartStore.clearCart).not.toHaveBeenCalled();
    });
});
