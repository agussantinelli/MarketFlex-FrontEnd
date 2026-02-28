import { persistentAtom } from '@nanostores/persistent';
import { computed } from 'nanostores';
import type { Product } from '../types/product.types';
import type { CartStore } from '../types/cart.types';
import { calculatePromotions } from './promotionEngine.ts';

// Persist cart in localStorage
export const cart = persistentAtom<CartStore>('marketflex_cart', { items: [] }, {
    encode: JSON.stringify,
    decode: JSON.parse
});

// Actions
export const addItem = (product: Product, quantity: number) => {
    const currentCart = cart.get();
    const existingItem = currentCart.items.find(item => item.id === product.id);
    const currentQtyInCart = existingItem?.quantity || 0;
    const newTotalQty = currentQtyInCart + quantity;

    if (newTotalQty > product.stock) {
        return {
            success: false,
            message: `No hay suficiente stock. Ya tenés ${currentQtyInCart} unidad(es) en el carrito y el máximo disponible es ${product.stock}.`
        };
    }

    if (existingItem) {
        const newItems = currentCart.items.map(item =>
            item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
        );
        cart.set({ ...currentCart, items: newItems });
    } else {
        cart.set({
            ...currentCart,
            items: [...currentCart.items, { ...product, quantity }]
        });
    }
    return { success: true };
};

export const removeItem = (productId: string) => {
    const currentCart = cart.get();
    cart.set({
        ...currentCart,
        items: currentCart.items.filter(item => item.id !== productId)
    });
};

export const updateQuantity = (productId: string, quantity: number) => {
    const currentCart = cart.get();
    const item = currentCart.items.find(i => i.id === productId);

    if (item && quantity > item.stock) {
        return {
            success: false,
            message: `No podés agregar más de ${item.stock} unidades de este producto.`
        };
    }

    const newItems = currentCart.items.map(item =>
        item.id === productId ? { ...item, quantity } : item
    );
    cart.set({ ...currentCart, items: newItems });
    return { success: true };
};

export const clearCart = () => {
    cart.set({ items: [] });
};

// Computed values
export const cartItems = computed(cart, c => c.items);
export const cartCount = computed(cart, c =>
    c.items.reduce((acc, item) => acc + item.quantity, 0)
);

// This will return an object with total, subtotal, and applied discounts
export const cartTotals = computed(cart, c => {
    return calculatePromotions(c.items);
});
