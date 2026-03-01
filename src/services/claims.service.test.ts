import { describe, it, expect, vi, beforeEach } from 'vitest';
import { claimsService } from './claims.service';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn().mockReturnThis(),
        json: vi.fn()
    }
}));

describe('ClaimsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAll', () => {
        it('should fetch all claims successfully', async () => {
            const mockClaims = [
                {
                    compraId: 'c1',
                    nroReclamo: 1,
                    motivo: 'M1',
                    descripcion: 'D1',
                    respuesta: 'R1',
                    fecha: '2023-01-01',
                    estado: 'PENDIENTE',
                    usuarioEmail: 'user@test.com',
                    usuarioNombre: 'Juan Perez'
                }
            ];

            (api.get as any).mockReturnValue({
                json: vi.fn().mockResolvedValueOnce({ status: 'success', data: mockClaims })
            });

            const result = await claimsService.getAll();

            expect(api.get).toHaveBeenCalledWith('claims');
            expect(result).toEqual(mockClaims);
        });

        it('should throw error if get fails', async () => {
            (api.get as any).mockReturnValue({
                json: vi.fn().mockRejectedValueOnce(new Error('Server error'))
            });

            await expect(claimsService.getAll()).rejects.toThrow('Server error');
        });
    });
});
