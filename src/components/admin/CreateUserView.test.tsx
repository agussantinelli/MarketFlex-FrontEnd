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
        // Use getAllByText for 'Nuevo Usuario' because it appears in header and breadcrumb/description
        expect(screen.getAllByText(/Nuevo Usuario/i).length).toBeGreaterThan(0);
        expect(screen.getByRole('button', { name: /Crear Usuario/i })).toBeDefined();
    });

    it('calls AdminService.createUser on valid submit', async () => {
        (AdminService.createUser as any).mockResolvedValue({ status: 'success' });

        render(<CreateUserView />);
        mockTriggerSileo.mockClear();

        // Fill ALL required fields to bypass browser/manual validation
        fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { name: 'nombre', value: 'Carlos' } });
        fireEvent.change(screen.getByLabelText(/Apellido/i), { target: { name: 'apellido', value: 'Gomez' } });
        fireEvent.change(screen.getByLabelText(/DNI \/ ID/i), { target: { name: 'dni', value: '44555666' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { name: 'email', value: 'carlos@example.com' } });
        fireEvent.change(screen.getByLabelText(/Tipo de ID/i), { target: { name: 'tipoDni', value: 'DNI' } });
        fireEvent.change(screen.getByLabelText(/Rol del Usuario/i), { target: { name: 'rol', value: 'customer' } });
        fireEvent.change(screen.getByLabelText(/Fecha Nacimiento/i), { target: { name: 'fechaNacimiento', value: '1990-01-01' } });
        fireEvent.change(screen.getByLabelText(/País/i), { target: { name: 'paisNacimiento', value: 'Argentina' } });
        fireEvent.change(screen.getByLabelText(/Ciudad/i), { target: { name: 'ciudadResidencia', value: 'Rosario' } });
        fireEvent.change(screen.getByLabelText(/Código Postal/i), { target: { name: 'codigoPostal', value: '2000' } });

        const submitButton = screen.getByRole('button', { name: /Crear Usuario/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(AdminService.createUser).toHaveBeenCalled();
            expect(mockTriggerSileo).toHaveBeenCalledWith('success', expect.stringContaining('éxito'));
        }, { timeout: 4000 });
    });

    it('handles server errors gracefully', async () => {
        (AdminService.createUser as any).mockResolvedValue({ status: 'error', message: 'DNI ya existe' });

        render(<CreateUserView />);
        mockTriggerSileo.mockClear();

        // Fill required fields
        fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { name: 'nombre', value: 'Carlos' } });
        fireEvent.change(screen.getByLabelText(/Apellido/i), { target: { name: 'apellido', value: 'Gomez' } });
        fireEvent.change(screen.getByLabelText(/DNI \/ ID/i), { target: { name: 'dni', value: '44555666' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { name: 'email', value: 'carlos@example.com' } });
        fireEvent.change(screen.getByLabelText(/Tipo de ID/i), { target: { name: 'tipoDni', value: 'DNI' } });
        fireEvent.change(screen.getByLabelText(/Rol del Usuario/i), { target: { name: 'rol', value: 'customer' } });
        fireEvent.change(screen.getByLabelText(/Fecha Nacimiento/i), { target: { name: 'fechaNacimiento', value: '1990-01-01' } });
        fireEvent.change(screen.getByLabelText(/País/i), { target: { name: 'paisNacimiento', value: 'Argentina' } });
        fireEvent.change(screen.getByLabelText(/Ciudad/i), { target: { name: 'ciudadResidencia', value: 'Rosario' } });
        fireEvent.change(screen.getByLabelText(/Código Postal/i), { target: { name: 'codigoPostal', value: '2000' } });

        const submitButton = screen.getByRole('button', { name: /Crear Usuario/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockTriggerSileo).toHaveBeenCalledWith('error', 'DNI ya existe');
        }, { timeout: 4000 });
    });
});
