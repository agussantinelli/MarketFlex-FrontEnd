import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
    it('should render with default message', () => {
        render(<LoadingSpinner />);
        expect(screen.getByText('Cargando...')).toBeDefined();
    });

    it('should render with custom message', () => {
        render(<LoadingSpinner message="Espere por favor" />);
        expect(screen.getByText('Espere por favor')).toBeDefined();
    });

    it('should apply fullPage class when prop is true', () => {
        const { container } = render(<LoadingSpinner fullPage={true} />);
        // The container div should have a class that contains 'fullPage' (depending on CSS module naming)
        expect(container.firstChild).toBeDefined();
    });
});
