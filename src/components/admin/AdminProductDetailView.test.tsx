import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminProductDetailView from './AdminProductDetailView';
import { AdminService } from '../../services/admin.service';

// Mock AdminService
vi.mock('../../services/admin.service', () => ({
    AdminService: {
        getAdminProduct: vi.fn()
    }
}));

const mockProduct = {
    status: 'success',
    data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nombre: 'Producto Test Pro',
        descripcion: 'Una descripción de prueba muy detallada.',
        precioActual: 25000,
        stock: 15,
        marca: 'TechBrand',
        categoria: 'Electrónica',
        subcategoria: 'Computación',
        foto: 'https://example.com/foto.jpg',
        esDestacado: true,
        envioGratis: true,
        estado: 'ACTIVO',
        tags: ['nuevo', 'pro', 'tech'],
        caracteristicas: [
            { nombre: 'Color', valor: 'Negro' },
            { nombre: 'Garantía', valor: '1 año' }
        ],
        creadoEn: '2026-01-01T10:00:00Z',
        actualizadoEn: '2026-03-01T15:30:00Z'
    }
};

describe('AdminProductDetailView Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders product details correctly when data is fetched', async () => {
        (AdminService.getAdminProduct as any).mockResolvedValue(mockProduct);

        render(<AdminProductDetailView productId="550e8400-e29b-41d4-a716-446655440000" />);

        // Wait for loading to finish and content to appear
        expect(await screen.findByText('Producto Test Pro')).toBeDefined();

        // Verify key fields
        expect(screen.getByText('Una descripción de prueba muy detallada.')).toBeDefined();
        expect(screen.getByText('TechBrand')).toBeDefined();
        expect(screen.getByText('15 unidades')).toBeDefined();
        expect(screen.getByText('$ 25.000,00')).toBeDefined();

        // Verify badges
        expect(screen.getByText('Destacado')).toBeDefined();
        expect(screen.getByText('Envío Gratis')).toBeDefined();

        // Verify characteristics
        expect(screen.getByText('Color')).toBeDefined();
        expect(screen.getByText('Negro')).toBeDefined();

        // Verify tags
        expect(screen.getByText('nuevo')).toBeDefined();
        expect(screen.getByText('tech')).toBeDefined();

        // Verify "Editar" button existence and link
        const editButton = screen.getByText(/Editar Producto/i).closest('a');
        expect(editButton).toHaveAttribute('href', '/admin/products/550e8400-e29b-41d4-a716-446655440000/edit');
    });

    it('shows error state when product is not found', async () => {
        (AdminService.getAdminProduct as any).mockResolvedValue({
            status: 'error',
            message: 'Producto no encontrado'
        });

        render(<AdminProductDetailView productId="invalid-id" />);

        expect(await screen.findByText('Producto no encontrado')).toBeDefined();
        expect(screen.getByText(/Volver a Productos/i)).toBeDefined();
    });
});
