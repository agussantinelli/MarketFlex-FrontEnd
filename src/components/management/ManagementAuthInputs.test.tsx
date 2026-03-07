import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ManagementAuthInputs from './ManagementAuthInputs';

describe('ManagementAuthInputs Component', () => {
    const mockFormData = {
        nombre: 'Juan',
        apellido: 'Perez',
        dni: '12345678',
        tipoDni: 'DNI',
        email: 'juan@example.com',
        password: '',
        fechaNacimiento: '1990-01-01',
        paisNacimiento: 'Argentina',
        ciudadResidencia: 'Rosario',
        codigoPostal: '2000',
        rol: 'customer'
    };

    const mockOnChange = vi.fn();

    it('renders all fields with correct initial values', () => {
        render(<ManagementAuthInputs formData={mockFormData} onChange={mockOnChange} />);

        expect((screen.getByLabelText(/Nombre/i) as HTMLInputElement).value).toBe('Juan');
        expect((screen.getByLabelText(/Apellido/i) as HTMLInputElement).value).toBe('Perez');
        expect((screen.getByLabelText(/DNI \/ ID/i) as HTMLInputElement).value).toBe('12345678');
        expect((screen.getByLabelText(/Correo Electrónico/i) as HTMLInputElement).value).toBe('juan@example.com');
        expect((screen.getByLabelText(/Ciudad/i) as HTMLInputElement).value).toBe('Rosario');
    });

    it('calls onChange when values are updated', () => {
        render(<ManagementAuthInputs formData={mockFormData} onChange={mockOnChange} />);

        const nombreInput = screen.getByLabelText(/Nombre/i);
        fireEvent.change(nombreInput, { target: { name: 'nombre', value: 'Carlos' } });

        expect(mockOnChange).toHaveBeenCalled();
    });

    it('disables fields specified in readonlyFields prop', () => {
        render(
            <ManagementAuthInputs
                formData={mockFormData}
                onChange={mockOnChange}
                readonlyFields={['email', 'dni']}
            />
        );

        expect(screen.getByLabelText(/Correo Electrónico/i).hasAttribute('readonly')).toBe(true);
        expect(screen.getByLabelText(/DNI \/ ID/i).hasAttribute('readonly')).toBe(true);
        expect(screen.getByLabelText(/Nombre/i).hasAttribute('readonly')).toBe(false);
    });

    it('shows password hint when not in edit mode', () => {
        render(<ManagementAuthInputs formData={mockFormData} onChange={mockOnChange} isEdit={false} />);
        expect(screen.getByText(/Si se deja vacío, se asignará por defecto/i)).toBeDefined();
    });

    it('shows "no password" warning in edit mode if hasPassword is false', () => {
        render(
            <ManagementAuthInputs
                formData={mockFormData}
                onChange={mockOnChange}
                isEdit={true}
                hasPassword={false}
            />
        );
        expect(screen.getByText(/Este usuario no tiene una contraseña asignada/i)).toBeDefined();
    });
});

