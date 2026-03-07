import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubcategoriesListView from './SubcategoriesListView';
import { subcategoryService } from '../../services/subcategory.service';

vi.mock('../../services/subcategory.service', () => ({
    subcategoryService: {
        getSubcategories: vi.fn(),
        getProductsBySubcategory: vi.fn(),
        createSubcategory: vi.fn(),
        updateSubcategory: vi.fn(),
        deleteSubcategory: vi.fn(),
    }
}));

// Mock Sileo and admin loader globals
const setupGlobalMocks = () => {
    (window as any).triggerSileo = vi.fn();
    (window as any).showManagementLoader = vi.fn();
    (window as any).hideManagementLoader = vi.fn();
    (window as any).showDeleteSubcategoryModal = vi.fn();
};

const mockSubcategories = [
    { categoriaId: '1', nroSubcategoria: 1, nombre: 'Novela', productCount: 5 },
    { categoriaId: '1', nroSubcategoria: 2, nombre: 'Poesía', productCount: 0 },
];

describe('SubcategoriesListView Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupGlobalMocks();
    });

    it('shows loading state while fetching and renders subcategories', async () => {
        (subcategoryService.getSubcategories as any).mockResolvedValue(mockSubcategories);

        render(<SubcategoriesListView categoriaId="1" />);

        expect(screen.getByText(/Cargando subcategorías/i)).toBeDefined();

        await waitFor(() => {
            expect(screen.getByText('Novela')).toBeDefined();
            expect(screen.getByText('Poesía')).toBeDefined();
        });

        expect(subcategoryService.getSubcategories).toHaveBeenCalledWith('1');
    });

    it('renders empty state when no subcategories exist', async () => {
        (subcategoryService.getSubcategories as any).mockResolvedValue([]);

        render(<SubcategoriesListView categoriaId="1" />);

        await waitFor(() => {
            expect(screen.getByText('Lista de Subcategorías')).toBeDefined();
        });
    });

    it('renders the page header and title', async () => {
        (subcategoryService.getSubcategories as any).mockResolvedValue([]);

        render(<SubcategoriesListView categoriaId="1" />);

        await waitFor(() => {
            expect(screen.getByText('Subcategorías')).toBeDefined();
        });

        expect(screen.getByText('Nueva Subcategoría')).toBeDefined();
    });

    it('calls getSubcategories with the correct categoriaId on mount', async () => {
        (subcategoryService.getSubcategories as any).mockResolvedValue([]);

        render(<SubcategoriesListView categoriaId="cat-99" />);

        await waitFor(() => {
            expect(subcategoryService.getSubcategories).toHaveBeenCalledWith('cat-99');
        });
    });

    it('shows product count for each subcategory', async () => {
        (subcategoryService.getSubcategories as any).mockResolvedValue(mockSubcategories);

        render(<SubcategoriesListView categoriaId="1" />);

        await waitFor(() => {
            expect(screen.getByText(/5 productos/i)).toBeDefined();
            expect(screen.getByText(/0 productos/i)).toBeDefined();
        });
    });
});
