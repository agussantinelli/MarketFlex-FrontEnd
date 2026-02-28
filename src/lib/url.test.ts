import { describe, it, expect, vi } from 'vitest';
import { getImageUrl } from './url';

// Mock import.meta.env
vi.mock('../../env.d.ts', () => ({}));

describe('getImageUrl', () => {
    it('should return placeholder for null or undefined paths', () => {
        expect(getImageUrl(null)).toBe('/placeholder.png');
        expect(getImageUrl(undefined)).toBe('/placeholder.png');
    });

    it('should return absolute URLs as is (Cloudinary)', () => {
        const cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
        expect(getImageUrl(cloudinaryUrl)).toBe(cloudinaryUrl);
    });

    it('should handle local paths starting with /', () => {
        const path = '/products/item.jpg';
        const result = getImageUrl(path);
        // By default should use localhost:5979 if no env is set in test env
        expect(result).toContain('http://localhost:5979');
        expect(result).toContain(path);
    });

    it('should handle local paths not starting with /', () => {
        const path = 'seed_photos/book.jpg';
        const result = getImageUrl(path);
        expect(result).toBe(`http://localhost:5979/${path}`);
    });
});
