import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateProductView from './CreateProductView';
import { AdminService } from '../../services/admin.service';
import { api } from '../../lib/api';

// Mock dependencies
vi.mock('../../services/admin.service', () => ({
    AdminService: {
        createProduct: vi.fn()
    }
}));

vi.mock('../../lib/api', () => ({
    api: {
        get: vi.fn()
    }
}));

vi.mock('../../services/upload.service', () => ({
    uploadService: {
        uploadImage: vi.fn()
    }
}));

describe('CreateProductView', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock Sileo global
        (window as any).triggerSileo = vi.fn();

        // Mock categories API response
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValue({
                status: 'success',
                data: [
                    {
                        id: 'cat-1',
                        nombre: 'Electrónica',
                        subcategorias: [{ nroSubcategoria: 1, nombre: 'Celulares' }]
                    }
                ]
            })
        });
    });

    it('should render the form with all necessary fields', async () => {
        render(<CreateProductView />);

        expect(screen.getByText('Nuevo Producto')).toBeInTheDocument();
        expect(screen.getByLabelText(/Nombre del Producto/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Precio \(\$\)/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Stock Inicial/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Categoría/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Subcategoría/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Marca/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Crear Producto/i })).toBeInTheDocument();
    });

    it('should show an error if submitting without required fields', async () => {
        render(<CreateProductView />);

        // Submit early without filling required fields
        fireEvent.click(screen.getByRole('button', { name: /Crear Producto/i }));

        // The default HTML5 validation might prevent submission, but if we bypass it or test the submit handler directly:
        // We'll trust the manual check triggers sileo if it somehow gets bypassed
        // Since the button is of type submit, we can invoke the form submit
        const form = screen.getByRole('button', { name: /Crear Producto/i }).closest('form');
        fireEvent.submit(form!);

        // Sileo should be triggered for missing base fields
        expect((window as any).triggerSileo).toHaveBeenCalledWith('warning', 'Por favor, completá todos los campos base obligatorios.');
    });

    it('should submit successfully when all required fields are filled', async () => {
        (AdminService.createProduct as any).mockResolvedValue({ status: 'success' });

        render(<CreateProductView />);

        // Wait for categories to load
        await waitFor(() => {
            expect(screen.getByText('Electrónica')).toBeInTheDocument();
        });

        // Fill basic required fields
        fireEvent.change(screen.getByLabelText(/Nombre del Producto/i), { target: { value: 'Test Product' } });
        fireEvent.change(screen.getByLabelText(/Descripción/i), { target: { value: 'Test Description' } });
        fireEvent.change(screen.getByLabelText(/Precio/i), { target: { value: '100' } });
        fireEvent.change(screen.getByLabelText(/Stock Inicial/i), { target: { value: '10' } });

        // Select Category & Subcategory
        fireEvent.change(screen.getByLabelText(/Categoría/i), { target: { value: 'cat-1' } });

        // Wait for subcategories to enable
        await waitFor(() => {
            expect(screen.getByLabelText(/Subcategoría/i)).not.toBeDisabled();
        });
        fireEvent.change(screen.getByLabelText(/Subcategoría/i), { target: { value: '1' } });

        // Fill Marca
        fireEvent.change(screen.getByLabelText(/Marca/i), { target: { value: 'Test Brand' } });

        // Submit form
        const form = screen.getByRole('button', { name: /Crear Producto/i }).closest('form');
        fireEvent.submit(form!);

        // Assert API was called correctly
        await waitFor(() => {
            expect(AdminService.createProduct).toHaveBeenCalledWith(expect.objectContaining({
                nombre: 'Test Product',
                descripcion: 'Test Description',
                precioActual: 100,
                stock: 10,
                categoriaId: 'cat-1',
                nroSubcategoria: 1,
                marca: 'Test Brand'
            }));
            expect((window as any).triggerSileo).toHaveBeenCalledWith('success', '¡Producto creado exitosamente!');
        });
    });
});
