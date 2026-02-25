import type { CartItem } from './cartStore';

export interface PromotionResult {
    subtotal: number;
    discount: number;
    total: number;
    appliedPromotions: {
        nombre: string;
        monto: number;
    }[];
}

/**
 * Core engine for calculating complex promotions.
 * Handles:
 * 1. Simple individual discounts (precioConDescuento).
 * 2. Multi-quantity promotions (2x1, 3x2, etc.).
 * 3. Percentage off second unit (e.g., 50% off 2nd unit).
 * 4. Cross-product promotions (logic to be expanded as needed).
 */
export const calculatePromotions = (items: CartItem[]): PromotionResult => {
    let subtotal = 0;
    let totalDiscount = 0;
    const appliedPromotions: { nombre: string; monto: number }[] = [];

    // 1. Group items by their active promotion to handle bundle logic
    // We group by promotion name/type to detect multi-product coverage
    const promoGroups: Record<string, CartItem[]> = {};
    const individualItems: CartItem[] = [];

    items.forEach(item => {
        const promo = item.promocionActiva;
        if (promo && promo.tipoPromocion !== 'DESCUENTO_DIRECTO') {
            const promoId = promo.nombre; // We use name as a simple grouper for now
            if (!promoGroups[promoId]) promoGroups[promoId] = [];
            promoGroups[promoId].push({ ...item });
        } else {
            individualItems.push({ ...item });
        }
    });

    // Strategy: Calculate subtotal based on precioActual * quantity
    items.forEach(item => {
        subtotal += (item.precioActual || 0) * item.quantity;
    });

    // 2. Process Individual Discounts (Simple % off or Fixed amount)
    // IfprecioConDescuento is set, we use it as the unit price if no other complex promo applies
    individualItems.forEach(item => {
        if (item.precioConDescuento && item.precioActual) {
            const itemDiscount = (item.precioActual - item.precioConDescuento) * item.quantity;
            totalDiscount += itemDiscount;
            appliedPromotions.push({
                nombre: `Descuento ${item.descuentoActivo?.nombre || 'Directo'}: ${item.nombre}`,
                monto: itemDiscount
            });
        }
    });

    // 3. Process Complex Multi-product Promotions
    Object.entries(promoGroups).forEach(([promoName, groupItems]) => {
        if (!groupItems || groupItems.length === 0) return;

        const firstItem = groupItems[0];
        if (!firstItem || !firstItem.promocionActiva) return;

        const promo = firstItem.promocionActiva;

        // Sort items by price (usually cheaper one is discounted in bundles)
        const sortedItems = [...groupItems].sort((a, b) => (a.precioActual || 0) - (b.precioActual || 0));

        // Flatten all units in the group to apply logic across them
        const allUnits: number[] = [];
        sortedItems.forEach(item => {
            for (let i = 0; i < item.quantity; i++) {
                allUnits.push(item.precioActual || 0);
            }
        });

        const totalUnits = allUnits.length;
        let groupDiscount = 0;

        if (promo.tipoPromocion === 'CANTIDAD' && promo.cantCompra && promo.cantPaga) {
            // e.g., 2x1 -> buy 2, pay 1.
            const sets = Math.floor(totalUnits / promo.cantCompra);
            const freePerSet = promo.cantCompra - promo.cantPaga;

            // We discount the cheapest available units across the set
            for (let i = 0; i < sets * freePerSet; i++) {
                groupDiscount += allUnits[i] || 0;
            }
        }
        else if (promo.tipoPromocion === 'SEGUNDA_UNIDAD' && promo.porcentajeDescuentoSegunda) {
            // e.g., 50% off second unit
            const pairs = Math.floor(totalUnits / 2);
            const discountPercent = parseFloat(promo.porcentajeDescuentoSegunda) / 100;

            // Apply discount to the cheapest units that form a pair
            for (let i = 0; i < pairs; i++) {
                groupDiscount += (allUnits[i] || 0) * discountPercent;
            }
        }

        if (groupDiscount > 0) {
            totalDiscount += groupDiscount;
            appliedPromotions.push({
                nombre: promoName,
                monto: groupDiscount
            });
        } else {
            // Fallback to simple price discount if group logic didn't apply but item has a discount price
            groupItems.forEach(item => {
                if (item.precioConDescuento && item.precioActual) {
                    const itemDiscount = (item.precioActual - item.precioConDescuento) * item.quantity;
                    totalDiscount += itemDiscount;
                    appliedPromotions.push({
                        nombre: `Descuento: ${item.nombre}`,
                        monto: itemDiscount
                    });
                }
            });
        }
    });

    return {
        subtotal,
        discount: totalDiscount,
        total: subtotal - totalDiscount,
        appliedPromotions
    };
};
