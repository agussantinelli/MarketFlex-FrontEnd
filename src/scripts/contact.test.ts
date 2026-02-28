import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initContactForm } from './contact';
import * as supportService from '../services/support.service';

vi.mock('../services/support.service', () => ({
    sendSupportMessage: vi.fn(),
}));

describe('contact.ts', () => {
    let originalLocation: Location;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        document.body.innerHTML = `
            <form id="support-form">
                <input id="name" name="name" />
                <input id="email" name="email" />
                <input id="subject" name="subject" />
                <textarea name="message"></textarea>
                <button type="submit" class="submit-btn">Enviar</button>
            </form>
        `;

        originalLocation = window.location;
        delete (window as any).location;
        (window as any).location = {
            href: 'http://localhost/contacto',
            origin: 'http://localhost'
        };
    });

    afterEach(() => {
        (window as any).location = originalLocation;
    });

    it('should auto-fill form if user is in localStorage', () => {
        const user = { nombre: 'Agus', apellido: 'Santinelli', email: 'agus@test.com' };
        localStorage.setItem('marketflex_user', JSON.stringify(user));

        initContactForm();

        const nameInput = document.getElementById('name') as HTMLInputElement;
        const emailInput = document.getElementById('email') as HTMLInputElement;

        expect(nameInput.value).toBe('Agus Santinelli');
        expect(nameInput.readOnly).toBe(true);
        expect(emailInput.value).toBe('agus@test.com');
        expect(emailInput.readOnly).toBe(true);
    });

    it('should submit form and redirect on success', async () => {
        (supportService.sendSupportMessage as any).mockResolvedValueOnce({});
        initContactForm();

        const form = document.getElementById('support-form') as HTMLFormElement;
        const nameInput = document.getElementById('name') as HTMLInputElement;
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const subjectInput = document.getElementById('subject') as HTMLInputElement;
        const messageInput = document.querySelector('textarea') as HTMLTextAreaElement;

        nameInput.value = 'Test User';
        emailInput.value = 'user@test.com';
        subjectInput.value = 'Support Request';
        messageInput.value = 'Help me please';

        // Submit the form
        const submitEvent = new Event('submit', { cancelable: true });
        form.dispatchEvent(submitEvent);

        // Wait for async operations
        await vi.waitFor(() => {
            expect(supportService.sendSupportMessage).toHaveBeenCalledWith({
                nombre: 'Test User',
                email: 'user@test.com',
                asunto: 'Support Request',
                mensaje: 'Help me please'
            });
            expect(window.location.href).toContain('support_success=true');
        });
    });

    it('should handle error on submission and redirect to error URL', async () => {
        (supportService.sendSupportMessage as any).mockRejectedValueOnce(new Error('API failure'));
        initContactForm();

        const form = document.getElementById('support-form') as HTMLFormElement;

        form.dispatchEvent(new Event('submit'));

        await vi.waitFor(() => {
            expect(window.location.href).toContain('support_error=true');
        });
    });

    it('should update button text during submission', async () => {
        let resolvePromise: any;
        const promise = new Promise((resolve) => { resolvePromise = resolve; });
        (supportService.sendSupportMessage as any).mockReturnValueOnce(promise);

        initContactForm();

        const form = document.getElementById('support-form') as HTMLFormElement;
        const submitBtn = form.querySelector('.submit-btn') as HTMLButtonElement;

        form.dispatchEvent(new Event('submit'));

        expect(submitBtn.innerText).toBe('Enviando...');
        expect(submitBtn.disabled).toBe(true);

        resolvePromise({});
        await vi.waitFor(() => {
            expect(submitBtn.disabled).toBe(false);
        });
    });
});
