import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import Notifications from './Notifications';
import { sileo } from 'sileo';

// Mock sileo
vi.mock('sileo', () => ({
    Toaster: () => <div data-testid="toaster" />,
    sileo: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
    }
}));

describe('Notifications Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        // Mock window.location.search
        delete (window as any).location;
        (window as any).location = { search: '', href: '' };
        // Clean up triggerSileo
        delete (window as any).triggerSileo;
    });

    afterEach(() => {
        cleanup();
    });

    it('should trigger success notification when message is provided', async () => {
        render(<Notifications message="Test Success" type="success" delay={0} />);

        // Wait for timeout
        await new Promise(r => setTimeout(r, 10));

        expect(sileo.success).toHaveBeenCalledWith({ title: 'Test Success' });
    });

    it('should NOT trigger notification if requiredQueryParam is missing', async () => {
        (window as any).location.search = '';

        render(<Notifications message="Test Param" requiredQueryParam="success" delay={0} />);

        await new Promise(r => setTimeout(r, 10));

        expect(sileo.success).not.toHaveBeenCalled();
    });

    it('should trigger notification if requiredQueryParam is present in URL', async () => {
        (window as any).location.search = '?success=true';

        render(<Notifications message="Test Param" requiredQueryParam="success" delay={0} />);

        await new Promise(r => setTimeout(r, 10));

        expect(sileo.success).toHaveBeenCalledWith({ title: 'Test Param' });
    });

    it('should NOT trigger notification twice for same message in session', async () => {
        (window as any).location.search = '?success=true';

        const { unmount } = render(<Notifications message="Unique Message" requiredQueryParam="success" delay={0} />);
        await new Promise(r => setTimeout(r, 10));
        expect(sileo.success).toHaveBeenCalledTimes(1);

        unmount();

        render(<Notifications message="Unique Message" requiredQueryParam="success" delay={0} />);
        await new Promise(r => setTimeout(r, 10));

        // Should still be 1 call total
        expect(sileo.success).toHaveBeenCalledTimes(1);
    });

    it('should expose window.triggerSileo after mounting', () => {
        render(<Notifications />);

        expect(typeof window.triggerSileo).toBe('function');

        window.triggerSileo('error', 'Global Error');
        expect(sileo.error).toHaveBeenCalledWith({ title: 'Global Error' });
    });
});
