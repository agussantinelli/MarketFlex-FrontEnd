import { persistentAtom } from '@nanostores/persistent';
import { computed } from 'nanostores';
import type { Product } from '../types/product.types';
import { calculatePromotions } from './promotionEngine.ts';

export interface CartItem extends Product {
    quantity: number;
}

export interface CartStore {
    items: CartItem[];
}

// Persist cart in localStorage
export const cart = persistentAtom<CartStore>('marketflex_cart', { items: [] }, {
    encode: JSON.stringify,
    decode: JSON.parse
});

// Actions
export const addItem = (product: Product, quantity: number) => {
    const currentCart = cart.get();
    const existingItem = currentCart.items.find(item => item.id === product.id);

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
    const newItems = currentCart.items.map(item =>
        item.id === productId ? { ...item, quantity } : item
    );
    cart.set({ ...currentCart, items: newItems });
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
