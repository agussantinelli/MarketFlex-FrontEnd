import type { CartItem } from '../types/cart.types';
import type { PromotionResult } from '../types/promotion.types';

export const calculatePromotions = (items: CartItem[]): PromotionResult => {
    let subtotal = 0;
    let totalDiscount = 0;
    const appliedPromotions: { nombre: string; monto: number }[] = [];

    const getQty = (item: any): number => Number(item.cantidad || item.quantity || 0);

    const promoGroups: Record<string, CartItem[]> = {};
    const individualItems: CartItem[] = [];

    // 1. Clasificación de items
    items.forEach(item => {
        const promo = item.promocionActiva;
        if (promo && promo.tipoPromocion !== 'DESCUENTO_DIRECTO') {
            const promoId = promo.nombre || promo.tipoPromocion;
            if (!promoGroups[promoId]) promoGroups[promoId] = [];
            promoGroups[promoId].push({ ...item });
        } else {
            individualItems.push({ ...item });
        }
    });

    // 2. Subtotal base
    items.forEach(item => {
        subtotal += (Number(item.precioActual) || 0) * getQty(item);
    });

    // 3. Descuentos Individuales
    individualItems.forEach(item => {
        const pActual = Number(item.precioActual) || 0;
        const pDesc = Number(item.precioConDescuento);
        const qty = getQty(item);

        if (pDesc > 0 && pActual > pDesc) {
            const itemDiscount = (pActual - pDesc) * qty;
            totalDiscount += itemDiscount;
            appliedPromotions.push({
                nombre: `Descuento ${item.descuentoActivo?.nombre || 'Directo'}: ${item.nombre} `,
                monto: itemDiscount
            });
        }
    });

    // 4. Procesar Promociones de Grupo (Resuelve errores Ln 65, 111, 122)
    Object.entries(promoGroups).forEach(([promoName, groupItems]) => {
        const firstItemInGroup = groupItems[0];
        if (!firstItemInGroup || !firstItemInGroup.promocionActiva) return;

        // Extraemos 'promo' a una constante. TS ahora sabe que 'promo' NO es undefined en este bloque.
        const promo = firstItemInGroup.promocionActiva;
        let groupDiscount = 0;
        const remainderUnits: number[] = [];

        groupItems.forEach(item => {
            const price = Number(item.precioActual) || 0;
            const quantity = getQty(item);

            // CORRECCIÓN Ln 111 & 122: Usamos la constante 'promo' ya validada
            if (promo.tipoPromocion === 'NxM' && promo.cantCompra && promo.cantPaga) {
                const n = Number(promo.cantCompra);
                const m = Number(promo.cantPaga);
                if (n > 0) {
                    const sets = Math.floor(quantity / n);
                    groupDiscount += sets * (n - m) * price;
                    for (let i = 0; i < (quantity % n); i++) remainderUnits.push(price);
                }
            }
            else if (promo.tipoPromocion === 'DESCUENTO_SEGUNDA_UNIDAD' && promo.porcentajeDescuentoSegunda) {
                const pairs = Math.floor(quantity / 2);
                const disc = parseFloat(String(promo.porcentajeDescuentoSegunda)) / 100;
                groupDiscount += pairs * price * disc;
                if (quantity % 2 !== 0) remainderUnits.push(price);
            } else {
                for (let i = 0; i < quantity; i++) remainderUnits.push(price);
            }
        });

        // 5. Remanentes (Mix de productos)
        if (remainderUnits.length > 0) {
            remainderUnits.sort((a, b) => a - b);
            if (promo.tipoPromocion === 'NxM' && promo.cantCompra && promo.cantPaga) {
                const n = Number(promo.cantCompra);
                const m = Number(promo.cantPaga);
                const sets = Math.floor(remainderUnits.length / n);
                for (let i = 0; i < (sets * (n - m)); i++) groupDiscount += remainderUnits[i] || 0;
            }
            else if (promo.tipoPromocion === 'DESCUENTO_SEGUNDA_UNIDAD' && promo.porcentajeDescuentoSegunda) {
                const pairs = Math.floor(remainderUnits.length / 2);
                const disc = parseFloat(String(promo.porcentajeDescuentoSegunda)) / 100;
                for (let i = 0; i < pairs; i++) groupDiscount += (remainderUnits[i] || 0) * disc;
            }
        }

        if (groupDiscount > 0) {
            totalDiscount += groupDiscount;
            appliedPromotions.push({ nombre: promoName, monto: groupDiscount });
        }
    });

    const total = subtotal - totalDiscount;
    return {
        subtotal,
        discount: totalDiscount,
        total,
        appliedPromotions,
        originalPrice: subtotal,
        discountedPrice: total,
        appliedPromotion: appliedPromotions.length > 0 ? ({} as any) : null, // Fallback for compatibility
        savings: totalDiscount
    };
};