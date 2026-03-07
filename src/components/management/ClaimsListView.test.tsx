import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClaimsListView from './ClaimsListView';
import { claimsService } from '../../services/claims.service';

// Mock the service
vi.mock('../../services/claims.service', () => ({
    claimsService: {
        getAll: vi.fn(),
    },
}));

// Mock global triggerSileo
(window as any).triggerSileo = vi.fn();

const mockClaims = [
    {
        compraId: 'c1-uuid',
        nroReclamo: 1,
        motivo: 'Producto roto',
        descripcion: 'Llego roto',
        respuesta: null,
        fecha: '2023-01-01T10:00:00Z',
        estado: 'PENDIENTE',
        usuarioEmail: 'test@test.com',
        usuarioNombre: 'Juan Perez'
    },
    {
        compraId: 'c2-uuid',
        nroReclamo: 1,
        motivo: 'Demora',
        descripcion: 'No llega',
        respuesta: 'Ya va',
        fecha: '2023-01-02T10:00:00Z',
        estado: 'RESUELTO',
        usuarioEmail: 'ana@test.com',
        usuarioNombre: 'Ana Lopez'
    }
];

describe('ClaimsListView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (claimsService.getAll as any).mockResolvedValue(mockClaims);
    });

    it('renders the title and description', async () => {
        render(<ClaimsListView />);
        await waitFor(() => {
            expect(screen.getByText('Gestión de Reclamos')).toBeInTheDocument();
            expect(screen.getByText('Supervisá y resolvé las incidencias de los clientes en tiempo real.')).toBeInTheDocument();
            expect(screen.getByText('Producto roto')).toBeInTheDocument();
            expect(screen.getByText('Demora')).toBeInTheDocument();
        });
    });

    it('filters claims by search term', async () => {
        render(<ClaimsListView />);
        await waitFor(() => screen.getByText('Producto roto'));

        const searchInput = screen.getByPlaceholderText('Motivo, cliente o nro de compra...');
        fireEvent.change(searchInput, { target: { value: 'Demora' } });

        expect(screen.queryByText('Producto roto')).toBeNull();
        expect(screen.getByText('Demora')).toBeDefined();
    });

    it('filters claims by status', async () => {
        render(<ClaimsListView />);
        await waitFor(() => screen.getByText('Producto roto'));

        const filterSelect = screen.getByRole('combobox');
        fireEvent.change(filterSelect, { target: { value: 'RESUELTO' } });

        expect(screen.queryByText('Producto roto')).toBeNull();
        expect(screen.getByText('Demora')).toBeDefined();
    });

    it('shows empty state when no results found', async () => {
        render(<ClaimsListView />);
        await waitFor(() => screen.getByText('Producto roto'));

        const searchInput = screen.getByPlaceholderText('Motivo, cliente o nro de compra...');
        fireEvent.change(searchInput, { target: { value: 'NoExiste' } });

        expect(screen.getByText('No se encontraron reclamos que coincidan con los criterios.')).toBeDefined();
    });
});
