import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManagementSidebar from './ManagementSidebar';

describe('ManagementSidebar Component', () => {
    let originalLocation: Location;

    beforeEach(() => {
        // Mock window.location
        originalLocation = window.location;
        delete (window as any).location;
        (window as any).location = {
            pathname: '/management/dashboard',
            href: 'http://localhost/management/dashboard'
        };
    });

    afterEach(() => {
        // Restore window.location
        (window as any).location = originalLocation;
    });

    it('should render the administration logo and title', () => {
        render(<ManagementSidebar />);
        // "Gestión" appears both in the logo text and as a section title
        expect(screen.getAllByText('Gestión').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByAltText('MarketFlex Logo')).toBeInTheDocument();
    });

    it('should set active class on the Dashboard link when path is /management/dashboard', () => {
        render(<ManagementSidebar />);
        const dashboardLink = screen.getByText('Dashboard').closest('a');

        expect(dashboardLink).toBeInTheDocument();
        expect(dashboardLink?.getAttribute('href')).toBe('/management/dashboard');
        // The URL is currently /management/dashboard so it should have the 'active' module class
        // We can assert it contains the active class string from module.css mock
        expect(dashboardLink?.className).toMatch(/active/);
    });

    it('should set active class on the Productos link when path is /management/products', () => {
        (window as any).location.pathname = '/management/products';
        render(<ManagementSidebar />);
        const productsLink = screen.getByText('Productos').closest('a');

        expect(productsLink).toBeInTheDocument();
        expect(productsLink?.getAttribute('href')).toBe('/management/products');
        expect(productsLink?.className).toMatch(/active/);
    });

    it('should set active class on the Usuarios link when path is /management/users', () => {
        (window as any).location.pathname = '/management/users';
        render(<ManagementSidebar />);
        const usersLink = screen.getByText('Usuarios').closest('a');

        expect(usersLink).toBeInTheDocument();
        expect(usersLink?.getAttribute('href')).toBe('/management/users');
        expect(usersLink?.className).toMatch(/active/);
    });

    it('should render Mensajes link correctly', () => {
        render(<ManagementSidebar />);
        const messagesLink = screen.getByText('Mensajes').closest('a');
        expect(messagesLink).toBeInTheDocument();
        expect(messagesLink?.getAttribute('href')).toBe('/management/support');
    });

    it('should not set active class on the Dashboard link for other paths', () => {
        (window as any).location.pathname = '/management/other';
        render(<ManagementSidebar />);
        const dashboardLink = screen.getByText('Dashboard').closest('a');

        expect(dashboardLink?.className).not.toMatch(/active/);
    });
});

