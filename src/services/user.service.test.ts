import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn().mockReturnThis(),
        patch: vi.fn().mockReturnThis(),
        json: vi.fn()
    }
}));

import { UserService } from './user.service';

describe('UserService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should get user profile', async () => {
        const mockUser = { id: '1', nombre: 'Agus' };
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce(mockUser)
        });

        const result = await UserService.getProfile();

        expect(api.get).toHaveBeenCalledWith('user/me');
        expect(result).toEqual(mockUser);
    });

    it('should update user profile', async () => {
        const updateData = { nombre: 'Agus Updated' };
        const mockUser = { id: '1', ...updateData };
        (api.patch as any).mockReturnValue({
            json: vi.fn().mockResolvedValueOnce(mockUser)
        });

        const result = await UserService.updateProfile(updateData as any);

        expect(api.patch).toHaveBeenCalledWith('user/me', expect.objectContaining({ json: updateData }));
        expect(result).toEqual(mockUser);
    });
});

