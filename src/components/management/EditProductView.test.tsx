import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditProductView from './EditProductView';
import { ManagementService } from '../../services/management\.service';
import { api } from '../../lib/api';

// Mock dependencies
vi.mock('../../services/management\.service', () => ({
    ManagementService: {
        getManagementProduct: vi.fn(),
        updateProduct: vi.fn(),
        generateTags: vi.fn()
    }
}));

vi.mock('../../lib/api', () => ({
    api: {
        get: vi.fn()
    }
}));

const mockProductData = {
    status: 'success',
    data: {
        id: '123',
        nombre: 'Producto Existente',
        descripcion: 'Descripción original',
        precioActual: 1500,
        stock: 5,
        marca: 'Marca X',
        categoriaId: 'cat-1',
        nroSubcategoria: 1,
        foto: 'img.jpg',
        esDestacado: false,
        estado: 'ACTIVO',
        tags: [['123', 1, 'tag1']],
        caracteristicas: [{ nombre: 'Peso', valor: '1kg' }]
    }
};

describe('EditProductView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (window as any).triggerSileo = vi.fn();

        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValue({
                status: 'success',
                data: [{ id: 'cat-1', nombre: 'Electrónica' }]
            })
        });

        (ManagementService.getManagementProduct as any).mockResolvedValue(mockProductData);
    });

    it('should render and load product data', async () => {
        render(<EditProductView productId="123" />);

        await waitFor(() => {
            expect(ManagementService.getManagementProduct).toHaveBeenCalledWith('123');
        });

        expect(screen.getByDisplayValue('Producto Existente')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Descripción original')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1500')).toBeInTheDocument();
        expect(screen.getByDisplayValue('5')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Marca X')).toBeInTheDocument();
    });

    it('should call updateProduct on submit', async () => {
        (ManagementService.updateProduct as any).mockResolvedValue({ status: 'success' });

        const { container } = render(<EditProductView productId="123" />);

        await waitFor(() => expect(screen.getByDisplayValue('Producto Existente')).toBeInTheDocument());

        const form = container.querySelector('form');
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(ManagementService.updateProduct).toHaveBeenCalled();
            expect((window as any).triggerSileo).toHaveBeenCalledWith('success', '¡Producto actualizado exitosamente!');
        });
    });

    it('should handle errors during update', async () => {
        (ManagementService.updateProduct as any).mockResolvedValue({ status: 'error', message: 'Error de prueba' });

        const { container } = render(<EditProductView productId="123" />);

        await waitFor(() => expect(screen.getByDisplayValue('Producto Existente')).toBeInTheDocument());

        const form = container.querySelector('form');
        fireEvent.submit(form!);

        await waitFor(() => {
            expect((window as any).triggerSileo).toHaveBeenCalledWith('error', 'Error de prueba');
        });
    });
});
