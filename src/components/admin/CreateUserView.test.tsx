import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateUserView from './CreateUserView';
import { AdminService } from '../../services/admin.service';

// Mock AdminService
vi.mock('../../services/admin.service', () => ({
    AdminService: {
        createUser: vi.fn()
    }
}));

// Mock window functions and sileo
const mockTriggerSileo = vi.fn();
const mockShowLoader = vi.fn();
const mockHideLoader = vi.fn();

(window as any).triggerSileo = mockTriggerSileo;
(window as any).showAdminLoader = mockShowLoader;
(window as any).hideAdminLoader = mockHideLoader;

describe('CreateUserView Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the creation form', () => {
        render(<CreateUserView />);
        expect(screen.getByText(/Nuevo Usuario/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /Crear Usuario/i })).toBeDefined();
    });

    it('shows warning when submitting empty required fields', async () => {
        render(<CreateUserView />);

        const submitButton = screen.getByRole('button', { name: /Crear Usuario/i });
        fireEvent.click(submitButton);

        expect(mockTriggerSileo).toHaveBeenCalledWith('warning', expect.stringContaining('completá todos los campos'));
        expect(AdminService.createUser).not.toHaveBeenCalled();
    });

    it('calls AdminService.createUser on valid submit', async () => {
        (AdminService.createUser as any).mockResolvedValue({ status: 'success' });

        render(<CreateUserView />);

        // Fill required fields
        fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { name: 'nombre', value: 'Carlos' } });
        fireEvent.change(screen.getByLabelText(/Apellido/i), { target: { name: 'apellido', value: 'Gomez' } });
        fireEvent.change(screen.getByLabelText(/DNI \/ ID/i), { target: { name: 'dni', value: '44555666' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { name: 'email', value: 'carlos@example.com' } });
        fireEvent.change(screen.getByLabelText(/Tipo de ID/i), { target: { name: 'tipoDni', value: 'DNI' } });
        fireEvent.change(screen.getByLabelText(/Rol del Usuario/i), { target: { name: 'rol', value: 'customer' } });

        const submitButton = screen.getByRole('button', { name: /Crear Usuario/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(AdminService.createUser).toHaveBeenCalled();
            expect(mockTriggerSileo).toHaveBeenCalledWith('success', expect.stringContaining('éxito'));
        }, { timeout: 3000 });
    });

    it('handles server errors gracefully', async () => {
        (AdminService.createUser as any).mockResolvedValue({ status: 'error', message: 'DNI ya existe' });

        render(<CreateUserView />);

        // Fill required fields
        fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { name: 'nombre', value: 'Carlos' } });
        fireEvent.change(screen.getByLabelText(/Apellido/i), { target: { name: 'apellido', value: 'Gomez' } });
        fireEvent.change(screen.getByLabelText(/DNI \/ ID/i), { target: { name: 'dni', value: '44555666' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { name: 'email', value: 'carlos@example.com' } });
        fireEvent.change(screen.getByLabelText(/Tipo de ID/i), { target: { name: 'tipoDni', value: 'DNI' } });
        fireEvent.change(screen.getByLabelText(/Rol del Usuario/i), { target: { name: 'rol', value: 'customer' } });

        const submitButton = screen.getByRole('button', { name: /Crear Usuario/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockTriggerSileo).toHaveBeenCalledWith('error', 'DNI ya existe');
        }, { timeout: 3000 });
    });
});
