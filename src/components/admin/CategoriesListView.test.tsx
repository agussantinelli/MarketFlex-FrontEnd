import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoriesListView from './CategoriesListView';
import { categoryService } from '../../services/category.service';

vi.mock('../../services/category.service', () => ({
    categoryService: {
        getCategories: vi.fn(),
        getProductsByCategory: vi.fn(),
        createCategory: vi.fn(),
        updateCategory: vi.fn(),
        deleteCategory: vi.fn(),
    },
}));

describe('CategoriesListView', () => {
    const mockCategories = [
        { id: '1', nombre: 'Libros', productCount: 5 },
        { id: '2', nombre: 'Revistas', productCount: 0 },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (categoryService.getCategories as any).mockResolvedValue(mockCategories);
        (window as any).showAdminLoader = vi.fn();
        (window as any).hideAdminLoader = vi.fn();
        (window as any).triggerSileo = vi.fn();
    });

    it('renders the category list', async () => {
        render(<CategoriesListView />);

        await waitFor(() => {
            expect(categoryService.getCategories).toHaveBeenCalled();
        });

        expect(await screen.findByText('Libros')).toBeDefined();
        expect(screen.getByText('Revistas')).toBeDefined();
        expect(screen.getByText('5 productos')).toBeDefined();
    });

    it('hides the view products button when count is 0', async () => {
        render(<CategoriesListView />);
        await screen.findByText('Libros');

        const row1 = screen.getByText('Libros').closest('tr');
        const row2 = screen.getByText('Revistas').closest('tr');

        expect(row1?.querySelector('button[title="Ver productos"]')).toBeDefined();
        expect(row2?.querySelector('button[title="Ver productos"]')).toBeNull();
    });

    it('opens create modal and creates a category', async () => {
        const newCategory = { id: '3', nombre: 'Comics' };
        (categoryService.createCategory as any).mockResolvedValue(newCategory);

        render(<CategoriesListView />);
        await screen.findByText('Libros');

        const createBtn = screen.getByText('Nueva Categoría');
        fireEvent.click(createBtn);

        const input = screen.getByPlaceholderText(/Ej: Libro/i);
        fireEvent.change(input, { target: { value: 'Comics' } });

        const submitBtn = screen.getByText('Crear Categoría');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(categoryService.createCategory).toHaveBeenCalledWith('Comics');
        });

        expect(await screen.findByText('Comics')).toBeDefined();
    });
});
