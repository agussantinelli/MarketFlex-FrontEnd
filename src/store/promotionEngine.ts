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
        subtotal += (Number(item.precioActual) || 0) * (item.quantity || 0);
    });

    // 2. Process Individual Discounts (Simple % off or Fixed amount)
    // If precioConDescuento is set, we use it as the unit price if no other complex promo applies
    individualItems.forEach(item => {
        const pActual = Number(item.precioActual) || 0;
        const pDesc = Number(item.precioConDescuento);

        if (pDesc > 0 && pActual > pDesc) {
            const itemDiscount = (pActual - pDesc) * (item.quantity || 0);
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
        let groupDiscount = 0;
        const remainderUnits: number[] = [];

        // STEP 1: Process INDIVIDUAL SKUs first to ensure fair discounting
        groupItems.forEach(item => {
            const price = Number(item.precioActual) || 0;
            const quantity = Number(item.quantity) || 0;

            if (promo.tipoPromocion === 'NxM' && promo.cantCompra && promo.cantPaga) {
                const n = Number(promo.cantCompra);
                const m = Number(promo.cantPaga);
                if (n > 0) {
                    const sets = Math.floor(quantity / n);
                    const freePerSet = n - m;
                    if (freePerSet > 0) {
                        groupDiscount += sets * freePerSet * price;
                    }
                    // Units that didn't form a full set
                    for (let i = 0; i < (quantity % n); i++) {
                        remainderUnits.push(price);
                    }
                }
            }
            else if (promo.tipoPromocion === 'DESCUENTO_SEGUNDA_UNIDAD' && promo.porcentajeDescuentoSegunda) {
                const pairs = Math.floor(quantity / 2);
                const discountPercent = (parseFloat(String(promo.porcentajeDescuentoSegunda)) || 0) / 100;
                if (discountPercent > 0) {
                    groupDiscount += pairs * price * discountPercent;
                }
                // Odd unit that didn't form a pair
                if (quantity % 2 !== 0) {
                    remainderUnits.push(price);
                }
            } else {
                // If it's a group promo but not one of the handled types, just push to remainder
                for (let i = 0; i < quantity; i++) {
                    remainderUnits.push(price);
                }
            }
        });

        // STEP 2: Process the POOL of remainders across different products
        if (remainderUnits.length > 0) {
            // Sort cheapest first
            remainderUnits.sort((a, b) => a - b);

            if (promo.tipoPromocion === 'NxM' && promo.cantCompra && promo.cantPaga) {
                const n = Number(promo.cantCompra);
                const m = Number(promo.cantPaga);
                const sets = Math.floor(remainderUnits.length / n);
                const freePerSet = n - m;
                if (freePerSet > 0) {
                    for (let i = 0; i < (sets * freePerSet); i++) {
                        groupDiscount += remainderUnits[i] || 0;
                    }
                }
            }
            else if (promo.tipoPromocion === 'DESCUENTO_SEGUNDA_UNIDAD' && promo.porcentajeDescuentoSegunda) {
                const pairs = Math.floor(remainderUnits.length / 2);
                const discountPercent = (parseFloat(String(promo.porcentajeDescuentoSegunda)) || 0) / 100;
                if (discountPercent > 0) {
                    for (let i = 0; i < pairs; i++) {
                        groupDiscount += (remainderUnits[i] || 0) * discountPercent;
                    }
                }
            }
        }

        if (groupDiscount > 0) {
            totalDiscount += groupDiscount;
            appliedPromotions.push({
                nombre: promoName,
                monto: groupDiscount
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
