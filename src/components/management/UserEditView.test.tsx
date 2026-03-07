import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserEditView from './UserEditView';
import { ManagementService } from '../../services/management\.service';

// Mock ManagementService
vi.mock('../../services/management\.service', () => ({
    ManagementService: {
        getUserById: vi.fn(),
        updateUser: vi.fn()
    }
}));

// Mock window functions and sileo
const mockTriggerSileo = vi.fn();
const mockShowLoader = vi.fn();
const mockHideLoader = vi.fn();
(window as any).triggerSileo = mockTriggerSileo;
(window as any).showManagementLoader = mockShowLoader;
(window as any).hideManagementLoader = mockHideLoader;

const mockUser = {
    id: 'user-123',
    nombre: 'Juan',
    apellido: 'Perez',
    dni: '12345678',
    tipoDni: 'DNI',
    email: 'juan@example.com',
    rol: 'customer',
    fechaNacimiento: '1990-01-01T00:00:00.000Z',
    pais: 'Argentina',
    ciudad: 'Rosario',
    codigoPostal: '2000'
};

describe('UserEditView Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches and populates user data on mount', async () => {
        (ManagementService.getUserById as any).mockResolvedValue({ status: 'success', data: mockUser });

        render(<UserEditView userId="user-123" />);

        await waitFor(() => {
            expect(ManagementService.getUserById).toHaveBeenCalledWith('user-123');
        });

        expect((screen.getByLabelText(/Nombre/i) as HTMLInputElement).value).toBe('Juan');
        expect((screen.getByLabelText(/Correo Electrónico/i) as HTMLInputElement).value).toBe('juan@example.com');
        expect(screen.getByLabelText(/Correo Electrónico/i).hasAttribute('readonly')).toBe(true);
    });

    it('disables DNI edit if DNI was already present', async () => {
        (ManagementService.getUserById as any).mockResolvedValue({ status: 'success', data: mockUser });

        render(<UserEditView userId="user-123" />);

        await waitFor(() => {
            expect(screen.getByLabelText(/DNI \/ ID/i).hasAttribute('readonly')).toBe(true);
        });
    });

    it('allows DNI edit if DNI was initialy null', async () => {
        (ManagementService.getUserById as any).mockResolvedValue({
            status: 'success',
            data: { ...mockUser, dni: null }
        });

        render(<UserEditView userId="user-123" />);

        await waitFor(() => {
            expect(screen.getByLabelText(/DNI \/ ID/i).hasAttribute('readonly')).toBe(false);
        });
    });

    it('calls ManagementService.updateUser on valid submit', async () => {
        (ManagementService.getUserById as any).mockResolvedValue({ status: 'success', data: mockUser });
        (ManagementService.updateUser as any).mockResolvedValue({ status: 'success' });

        render(<UserEditView userId="user-123" />);

        await waitFor(() => {
            expect(screen.getByLabelText(/Nombre/i)).toBeDefined();
        });

        fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { name: 'nombre', value: 'Junior' } });

        const saveButton = screen.getByRole('button', { name: /Guardar Cambios/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(ManagementService.updateUser).toHaveBeenCalledWith('user-123', expect.objectContaining({
                nombre: 'Junior'
            }));
            expect(mockTriggerSileo).toHaveBeenCalledWith('success', expect.stringContaining('éxito'));
        });
    });
});
