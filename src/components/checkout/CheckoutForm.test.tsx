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
        expect(screen.getByText(/Dirección de Envío/i)).toBeDefined();
        expect(screen.getByText(/Método de Pago/i)).toBeDefined();
    });

    it('should render all input fields', () => {
        render(<CheckoutForm />);

        expect(screen.getByPlaceholderText(/Juan Pérez/i)).toBeDefined();
        expect(screen.getByPlaceholderText(/juan@ejemplo.com/i)).toBeDefined();
        expect(screen.getByPlaceholderText(/\+54 11 1234-5678/i)).toBeDefined();
        expect(screen.getByPlaceholderText(/Av. Siempre Viva 742/i)).toBeDefined();
    });

    it('should allow changing payment method', () => {
        render(<CheckoutForm />);

        const transferOption = screen.getByText(/Transferencia/i);
        const cashOption = screen.getByText(/Efectivo/i);
        const cardOption = screen.getByText(/Tarjeta/i);

        fireEvent.click(transferOption);
        expect(transferOption.closest('div')?.className).toContain('active');

        fireEvent.click(cashOption);
        expect(cashOption.closest('div')?.className).toContain('active');
        expect(transferOption.closest('div')?.className).not.toContain('active');

        fireEvent.click(cardOption);
        expect(cardOption.closest('div')?.className).toContain('active');
    });

    it('should update input values on change', () => {
        render(<CheckoutForm />);

        const nameInput = screen.getByLabelText(/Nombre Completo/i) as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'Agustín' } });

        expect(nameInput.value).toBe('Agustín');
    });
});
