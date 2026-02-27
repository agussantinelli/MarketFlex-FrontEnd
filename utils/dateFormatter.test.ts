import { describe, it, expect } from 'vitest';
import { formatDate, formatOrderDate } from './dateFormatter';

describe('dateFormatter utility', () => {
    const testDate = '2026-02-27T10:20:00Z'; // 10:20 AM UTC

    describe('formatDate', () => {
        it('should format date in DD/MM/YYYY, HH:MM AM/PM format (English locale)', () => {
            const result = formatDate(testDate);
            // Result depends on local timezone of runner, but we check format structure
            expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2} [AP]M/);
        });

        it('should return "Fecha inválida" for invalid dates', () => {
            expect(formatDate('invalid-date')).toBe('Fecha inválida');
        });
    });

    describe('formatOrderDate', () => {
        it('should format date exactly as DD/MM/YYYY, HH:MM AM/PM as requested', () => {
            const date = new Date(2026, 1, 21, 8, 20); // Feb 21, 2026, 08:20 AM
            const result = formatOrderDate(date);
            expect(result).toBe('21/02/2026, 08:20 AM');
        });

        it('should handle PM times correctly', () => {
            const date = new Date(2026, 1, 21, 20, 20); // Feb 21, 2026, 08:20 PM
            const result = formatOrderDate(date);
            expect(result).toBe('21/02/2026, 08:20 PM');
        });

        it('should handle midnight correctly', () => {
            const date = new Date(2026, 1, 21, 0, 5); // Feb 21, 2026, 12:05 AM
            const result = formatOrderDate(date);
            expect(result).toBe('21/02/2026, 12:05 AM');
        });

        it('should handle 12:00 PM correctly', () => {
            const date = new Date(2026, 1, 21, 12, 0); // Feb 21, 2026, 12:00 PM
            const result = formatOrderDate(date);
            expect(result).toBe('21/02/2026, 12:00 PM');
        });

        it('should return "---" for invalid dates', () => {
            expect(formatOrderDate('invalid-date')).toBe('---');
        });
    });
});
