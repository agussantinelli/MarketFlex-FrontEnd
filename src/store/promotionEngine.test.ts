import { describe, it, expect } from 'vitest';
import { calculatePromotions } from './promotionEngine';

describe('Promotion Engine', () => {
    it('should calculate subtotal correctly without promotions', () => {
        const items = [
            { id: '1', nombre: 'P1', precioActual: 100, cantidad: 2 }
        ] as any;
        const result = calculatePromotions(items);
        expect(result.subtotal).toBe(200);
        expect(result.discount).toBe(0);
        expect(result.total).toBe(200);
    });

    it('should apply percentage discount second unit', () => {
        const items = [
            {
                id: '1',
                nombre: 'P1',
                precioActual: 100,
                cantidad: 2,
                promocionActiva: {
                    tipoPromocion: 'DESCUENTO_SEGUNDA_UNIDAD',
                    porcentajeDescuentoSegunda: '70'
                }
            }
        ] as any;
        // 1 @ 100 + 1 @ 30 = 130
        const result = calculatePromotions(items);
        expect(result.total).toBe(130);
        expect(result.discount).toBe(70);
    });

    it('should apply NxM promotion', () => {
        const items = [
            {
                id: '1',
                nombre: 'P1',
                precioActual: 100,
                cantidad: 3,
                promocionActiva: {
                    tipoPromocion: 'NxM',
                    cantCompra: 3,
                    cantPaga: 2
                }
            }
        ] as any;
        // Buy 3, Pay 2 @ 100 = 200
        const result = calculatePromotions(items);
        expect(result.total).toBe(200);
        expect(result.discount).toBe(100);
    });
});
