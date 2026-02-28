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

    it('should set active class on the Productos link when path is /admin/products', () => {
        (window as any).location.pathname = '/admin/products';
        render(<AdminSidebar />);
        const productsLink = screen.getByText('Productos').closest('a');

        expect(productsLink).toBeInTheDocument();
        expect(productsLink?.getAttribute('href')).toBe('/admin/products');
        expect(productsLink?.className).toMatch(/active/);
    });

    it('should set active class on the Usuarios link when path is /admin/users', () => {
        (window as any).location.pathname = '/admin/users';
        render(<AdminSidebar />);
        const usersLink = screen.getByText('Usuarios').closest('a');

        expect(usersLink).toBeInTheDocument();
        expect(usersLink?.getAttribute('href')).toBe('/admin/users');
        expect(usersLink?.className).toMatch(/active/);
    });

    it('should render Mensajes link correctly', () => {
        render(<AdminSidebar />);
        const messagesLink = screen.getByText('Mensajes').closest('a');
        expect(messagesLink).toBeInTheDocument();
        expect(messagesLink?.getAttribute('href')).toBe('/admin/support');
    });

    it('should not set active class on the Dashboard link for other paths', () => {
        (window as any).location.pathname = '/admin/other';
        render(<AdminSidebar />);
        const dashboardLink = screen.getByText('Dashboard').closest('a');

        expect(dashboardLink?.className).not.toMatch(/active/);
    });
});
