import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupportListView from './SupportListView';
import { getSupportMessages } from '../../services/support.service';

vi.mock('../../services/support.service', () => ({
    getSupportMessages: vi.fn(),
}));

describe('SupportListView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock global silero notification
        window.triggerSileo = vi.fn();
    });

    it('should render loading state initially', () => {
        (getSupportMessages as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        render(<SupportListView />);
        expect(screen.getByText(/Cargando mensajes/i)).toBeInTheDocument();
    });

    it('should render empty state if no messages', async () => {
        (getSupportMessages as any).mockResolvedValue([]);
        render(<SupportListView />);

        await waitFor(() => {
            expect(screen.queryByText(/Cargando mensajes/i)).not.toBeInTheDocument();
        });

        expect(screen.getByText(/Bandeja de entrada vacía/i)).toBeInTheDocument();
    });

    it('should render messages correctly', async () => {
        const mockMessages = [
            {
                id: '1',
                nombre: 'John Doe',
                email: 'john@example.com',
                asunto: 'Test Subject',
                mensaje: 'Hello there',
                estado: 'Pendiente',
                creadoEn: '2023-01-01T10:00:00Z',
                actualizadoEn: '2023-01-01T10:00:00Z'
            }
        ];
        (getSupportMessages as any).mockResolvedValue(mockMessages);

        render(<SupportListView />);

        await waitFor(() => {
            expect(screen.getByText('Test Subject')).toBeInTheDocument();
        });

        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
        expect(screen.getByText(/"Hello there"/)).toBeInTheDocument();
        expect(screen.getByText('PENDIENTE')).toBeInTheDocument();
    });

    it('should handle error fetching messages', async () => {
        (getSupportMessages as any).mockRejectedValue(new Error('Network error'));

        render(<SupportListView />);

        await waitFor(() => {
            expect(window.triggerSileo).toHaveBeenCalledWith('error', 'Error al cargar los mensajes.');
        });

        expect(screen.getByText(/Bandeja de entrada vacía/i)).toBeInTheDocument();
    });
});
