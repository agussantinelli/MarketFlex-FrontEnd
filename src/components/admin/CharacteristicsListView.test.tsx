import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CharacteristicsListView from './CharacteristicsListView';
import { characteristicsService } from '../../services/characteristics.service';

// Mock characteristicsService
vi.mock('../../services/characteristics.service', () => ({
    characteristicsService: {
        getAll: vi.fn(),
        getProducts: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }
}));

const mockCharacteristics = [
    { id: '1', nombre: 'Material', productCount: 5 },
    { id: '2', nombre: 'Color', productCount: 3 }
];

describe('CharacteristicsListView Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock global window functions to avoid errors
        (window as any).showAdminLoader = vi.fn();
        (window as any).hideAdminLoader = vi.fn();
        (window as any).triggerSileo = vi.fn();
    });

    it('fetches and renders characteristics on mount', async () => {
        (characteristicsService.getAll as any).mockResolvedValue(mockCharacteristics);

        render(<CharacteristicsListView />);

        await waitFor(() => {
            expect(characteristicsService.getAll).toHaveBeenCalled();
        });

        expect(await screen.findByText(/Gestión de Características/i)).toBeDefined();
        expect(await screen.findByText('Material')).toBeDefined();
        expect(await screen.findByText('Color')).toBeDefined();
        expect(screen.getByText('5 productos')).toBeDefined();
        expect(screen.getByText('3 productos')).toBeDefined();
    });

    it('opens create modal when clicking "Nueva Característica"', async () => {
        (characteristicsService.getAll as any).mockResolvedValue(mockCharacteristics);
        render(<CharacteristicsListView />);

        const createBtn = screen.getByRole('button', { name: /nueva característica/i });
        fireEvent.click(createBtn);

        expect(screen.getByRole('heading', { name: /nueva característica/i })).toBeDefined();
        expect(screen.getByPlaceholderText('Ej: Material, Color, Talle...')).toBeDefined();
    });

    it('calls create service when submitting new characteristic', async () => {
        (characteristicsService.getAll as any).mockResolvedValue(mockCharacteristics);
        const newChar = { id: '3', nombre: 'Talle' };
        (characteristicsService.create as any).mockResolvedValue(newChar);

        render(<CharacteristicsListView />);

        fireEvent.click(screen.getByRole('button', { name: /nueva característica/i }));

        const input = screen.getByPlaceholderText('Ej: Material, Color, Talle...');
        fireEvent.change(input, { target: { value: 'Talle' } });

        const submitBtn = screen.getByText('Crear Característica');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(characteristicsService.create).toHaveBeenCalledWith('Talle');
        });

        expect(await screen.findByText('Talle')).toBeDefined();
    });

    it('opens products modal and fetches products', async () => {
        (characteristicsService.getAll as any).mockResolvedValue(mockCharacteristics);
        const mockProducts = [{ id: 'p1', nombre: 'Product 1', foto: null, valor: 'Cotton' }];
        (characteristicsService.getProducts as any).mockResolvedValue(mockProducts);

        render(<CharacteristicsListView />);

        const viewBtns = await screen.findAllByTitle('Ver productos');
        fireEvent.click(viewBtns[0]!);

        await waitFor(() => {
            expect(characteristicsService.getProducts).toHaveBeenCalledWith('1');
        });

        expect(await screen.findByText(/Productos con Material/i)).toBeDefined();
        expect(screen.getByText('Product 1')).toBeDefined();
        expect(screen.getByText('Valor: Cotton')).toBeDefined();
    });

    it('opens delete modal and calls delete service', async () => {
        (characteristicsService.getAll as any).mockResolvedValue(mockCharacteristics);
        (characteristicsService.delete as any).mockResolvedValue(undefined);

        render(<CharacteristicsListView />);

        const deleteBtns = await screen.findAllByTitle('Eliminar');
        fireEvent.click(deleteBtns[0]!);

        expect(screen.getByRole('heading', { name: /¿Eliminar Característica\?/i })).toBeDefined();

        const confirmBtn = screen.getByText('Eliminar permanentemente');
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(characteristicsService.delete).toHaveBeenCalledWith('1');
        });

        await waitFor(() => {
            expect(screen.queryByText('Material')).toBeNull();
        });
    });
});
