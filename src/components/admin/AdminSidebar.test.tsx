import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminSidebar from './AdminSidebar';

describe('AdminSidebar Component', () => {
    let originalLocation: Location;

    beforeEach(() => {
        // Mock window.location
        originalLocation = window.location;
        delete (window as any).location;
        (window as any).location = {
            pathname: '/admin/dashboard',
            href: 'http://localhost/admin/dashboard'
        };
    });

    afterEach(() => {
        // Restore window.location
        (window as any).location = originalLocation;
    });

    it('should render the administration logo and title', () => {
        render(<AdminSidebar />);
        expect(screen.getByText('Administración')).toBeInTheDocument();
        expect(screen.getByAltText('MarketFlex Logo')).toBeInTheDocument();
    });

    it('should set active class on the Dashboard link when path is /admin/dashboard', () => {
        render(<AdminSidebar />);
        const dashboardLink = screen.getByText('Dashboard').closest('a');

        expect(dashboardLink).toBeInTheDocument();
        expect(dashboardLink?.getAttribute('href')).toBe('/admin/dashboard');
        // The URL is currently /admin/dashboard so it should have the 'active' module class
        // We can assert it contains the active class string from module.css mock
        expect(dashboardLink?.className).toMatch(/active/);
    });

    it('should render "Próximamente" placeholder links showing disabled state', () => {
        render(<AdminSidebar />);

        const productsLink = screen.getByText('Productos (Próximamente)').closest('a');
        const usersLink = screen.getByText('Usuarios (Próximamente)').closest('a');
        const messagesLink = screen.getByText('Mensajes (Próximamente)').closest('a');

        expect(productsLink).toBeInTheDocument();
        expect(productsLink?.className).toMatch(/disabled/);

        expect(usersLink).toBeInTheDocument();
        expect(usersLink?.className).toMatch(/disabled/);

        expect(messagesLink).toBeInTheDocument();
        expect(messagesLink?.className).toMatch(/disabled/);
    });

    it('should not set active class on the Dashboard link for other paths', () => {
        (window as any).location.pathname = '/admin/other';
        render(<AdminSidebar />);
        const dashboardLink = screen.getByText('Dashboard').closest('a');

        expect(dashboardLink?.className).not.toMatch(/active/);
    });
});
