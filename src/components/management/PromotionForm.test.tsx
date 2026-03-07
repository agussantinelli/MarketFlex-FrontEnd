import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromotionForm from './PromotionForm';
import { categoryService } from '../../services/category.service';
import * as productService from '../../services/product.service';

vi.mock('../../services/category.service', () => ({
    categoryService: {
        getCategories: vi.fn(),
    }
}));

vi.mock('../../services/product.service', () => ({
    getProducts: vi.fn(),
}));

vi.mock('../../services/upload.service', () => ({
    uploadService: {
        uploadImage: vi.fn(),
    }
}));

const mockCategories = [
    { id: 'cat-1', nombre: 'Libros', productCount: 10 },
    { id: 'cat-2', nombre: 'Revistas', productCount: 5 },
];

const mockProducts = {
    data: [
        { id: 'p1', nombre: 'Libro A', precio: 1500, foto: null },
    ],
    total: 1
};

describe('PromotionForm Component', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (categoryService.getCategories as any).mockResolvedValue(mockCategories);
        (productService.getProducts as any).mockResolvedValue(mockProducts);
    });

    it('renders the form with default create state', async () => {
        const { container } = render(
            <PromotionForm
                promotion={undefined}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );

        await waitFor(() => {
            expect(categoryService.getCategories).toHaveBeenCalled();
            expect(productService.getProducts).toHaveBeenCalled();
        });

        expect(container.querySelector('input[name="nombre"]')).toBeTruthy();
    });

    it('pre-fills form fields when editing an existing promotion', async () => {
        const existingPromotion = {
            id: 'promo-1',
            nombre: 'Promo Verano',
            descripcion: 'Descuento especial',
            tipoPromocion: 'NxM' as const,
            alcance: 'GLOBAL' as const,
            fechaInicio: '2026-01-01T00:00:00Z',
            fechaFin: '2026-02-01T00:00:00Z',
            foto: 'https://cdn.test/promo.jpg',
            esDestacado: false,
            estado: 'ACTIVO' as const,
            cantCompra: 3,
            cantPaga: 2,
            porcentajeDescuentoSegunda: '30.00',
            categoryIds: [],
            productIds: [],
        };

        const { container } = render(
            <PromotionForm
                promotion={existingPromotion}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );

        await waitFor(() => {
            const input = container.querySelector('input[name="nombre"]') as HTMLInputElement;
            expect(input?.value).toBe('Promo Verano');
        });
    });

    it('calls onCancel when cancel button is clicked', async () => {
        render(
            <PromotionForm
                promotion={undefined}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );

        await waitFor(() => {
            expect(categoryService.getCategories).toHaveBeenCalled();
        });

        const cancelBtn = screen.getByText(/cancelar/i);
        cancelBtn.click();

        expect(mockOnCancel).toHaveBeenCalled();
    });

    it('loads categories and products on mount', async () => {
        render(
            <PromotionForm
                promotion={undefined}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );

        await waitFor(() => {
            expect(categoryService.getCategories).toHaveBeenCalledTimes(1);
            expect(productService.getProducts).toHaveBeenCalledWith(1, 50);
        });
    });
});
