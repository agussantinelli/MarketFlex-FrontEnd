import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateProductView from './CreateProductView';
import { ManagementService } from '../../services/management\.service';
import { api } from '../../lib/api';

// Mock dependencies
vi.mock('../../services/management\.service', () => ({
    ManagementService: {
        createProduct: vi.fn(),
        generateTags: vi.fn()
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

    it('should call generateTags when AI button is clicked with inputs', async () => {
        (ManagementService.generateTags as any).mockResolvedValue({ status: 'success', data: ['ia-tag'] });
        render(<CreateProductView />);

        const nameInput = screen.getByLabelText(/Nombre del Producto/i);
        const descInput = screen.getByLabelText(/Descripción/i);

        fireEvent.change(nameInput, { target: { value: 'Test' } });
        fireEvent.change(descInput, { target: { value: 'Desc' } });

        const aiBtn = screen.getByText(/IA Tags/i);
        fireEvent.click(aiBtn);

        await waitFor(() => {
            expect(ManagementService.generateTags).toHaveBeenCalledWith('Test', 'Desc', []);
        });
    });
});

