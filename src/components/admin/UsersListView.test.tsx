import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import UsersListView from './UsersListView';
import { AdminService } from '../../services/admin.service';

// Mock AdminService
vi.mock('../../services/admin.service', () => ({
    AdminService: {
        getUsers: vi.fn()
    }
}));

const mockUsersResponse = {
    status: 'success',
    data: [
        {
            id: '1',
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan@example.com',
            foto: null,
            rol: 'admin',
            creadoEn: '2026-02-28T10:00:00Z'
        },
        {
            id: '2',
            nombre: 'Maria',
            apellido: 'Gomez',
            email: 'maria@example.com',
            foto: 'avatar.jpg',
            rol: 'customer',
            creadoEn: '2026-02-28T11:00:00Z'
        }
    ],
    pagination: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
    }
};

describe('UsersListView Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches and renders users on mount', async () => {
        (AdminService.getUsers as any).mockResolvedValue(mockUsersResponse);

        render(<UsersListView />);

        // Check if service was called
        await waitFor(() => {
            expect(AdminService.getUsers).toHaveBeenCalled();
        });

        // Wait for the title which is inside DataTable
        expect(await screen.findByText(/Gestión de Usuarios/i)).toBeDefined();

        // Wait for the mock data
        const userCell1 = await screen.findByText('Juan Pérez');
        expect(userCell1).toBeDefined();
        expect(screen.getByText('juan@example.com')).toBeDefined();

        const userCell2 = await screen.findByText('Maria Gomez');
        expect(userCell2).toBeDefined();
        expect(screen.getByText('maria@example.com')).toBeDefined();
    });

    it('shows empty state when no users found', async () => {
        (AdminService.getUsers as any).mockResolvedValue({
            status: 'success',
            data: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
        });

        render(<UsersListView />);

        await waitFor(() => {
            expect(screen.getByText('No se encontraron resultados')).toBeDefined();
        });
    });
});
