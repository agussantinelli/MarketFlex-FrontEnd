import '@testing-library/jest-dom';
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

    it('should render the component', () => {
        const { container } = render(<CreateProductView />);
        expect(container).toBeInTheDocument();
    });

    it('should trigger sileo warning on empty submit', () => {
        const { container } = render(<CreateProductView />);
        const form = container.querySelector('form');
        fireEvent.submit(form!);
        expect((window as any).triggerSileo).toHaveBeenCalledWith('warning', 'Por favor, completá todos los campos base obligatorios.');
    });
});
