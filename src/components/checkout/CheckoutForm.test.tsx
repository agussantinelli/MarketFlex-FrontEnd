import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import CheckoutForm from './CheckoutForm';
import { vi } from 'vitest';

vi.mock('../../services/user.service', () => ({
    UserService: {
        getProfile: vi.fn().mockResolvedValue({
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan@ejemplo.com',
            telefono: '+54 11 1234-5678',
            direccion: 'Av. Siempre Viva 742',
            ciudad: 'CABA',
            provincia: 'Buenos Aires',
            codigoPostal: '1425'
        })
    }
}));

describe('CheckoutForm Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('should render all form sections', () => {
        render(<CheckoutForm />);

        expect(screen.getByText(/Información Personal/i)).toBeDefined();
        expect(screen.getByText(/Medio de Entrega/i)).toBeDefined();
        expect(screen.getByText(/Método de Pago/i)).toBeDefined();
    });

    it('should render all input fields', () => {
        render(<CheckoutForm />);

        expect(screen.getByPlaceholderText(/Juan Pérez/i)).toBeDefined();
        expect(screen.getByPlaceholderText(/juan@ejemplo.com/i)).toBeDefined();
        expect(screen.getByPlaceholderText(/\+54 11 1234-5678/i)).toBeDefined();
        // Address fields are visible because 'ENVIO_DOMICILIO' is default in checkoutStore
        expect(screen.getByPlaceholderText(/Av. Siempre Viva 742/i)).toBeDefined();
    });

    it('should allow changing payment method', () => {
        render(<CheckoutForm />);

        const cashOption = screen.getByText(/Efectivo/i);
        const mpOption = screen.getByText(/Mercado Pago/i);

        fireEvent.click(cashOption);
        expect(cashOption.closest('div')?.className).toContain('active');
        expect(mpOption.closest('div')?.className).not.toContain('active');

        fireEvent.click(mpOption);
        expect(mpOption.closest('div')?.className).toContain('active');
    });

    it('should update input values on change', () => {
        render(<CheckoutForm />);

        const nameInput = screen.getByLabelText(/Nombre Completo/i) as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'Agustín' } });

        expect(nameInput.value).toBe('Agustín');
    });
});
