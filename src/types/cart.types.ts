import type { Product } from './product.types';

export type CartItem = Product & {
    quantity: number;
};

export type CartStore = {
    items: CartItem[];
};
