import React from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, cartTotals, updateQuantity, removeItem, clearCart } from '../../store/cartStore';
import styles from './styles/CartView.module.css';

const CartView: React.FC = () => {
    const items = useStore(cartItems);
    const totals = useStore(cartTotals);

    if (items.length === 0) {
        return (
            <div className={styles.emptyCart}>
                <div className={styles.emptyIcon}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                </div>
                <h2>Tu carrito está vacío</h2>
                <p>Parece que aún no has agregado nada a tu carrito de compras.</p>
                <a href="/search?explore=true" className={styles.continueShopping}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Seguir explorando
                </a>
            </div>
        );
    }

    return (
        <div className={styles.cartContainer}>
            <header className={styles.cartHeader}>
                <h1>Tu Carrito</h1>
                <button className={styles.removeBtn} onClick={() => {
                    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) clearCart();
                }}>
                    Vaciar carrito
                </button>
            </header>

            <div className={styles.cartLayout}>
                <div className={styles.cartItemsList}>
                    {items.map((item) => (
                        <div key={item.id} className={styles.cartItem}>
                            <img
                                src={item.foto ? `http://localhost:5979/${item.foto}` : '/placeholder.png'}
                                alt={item.nombre}
                                className={styles.itemImage}
                            />

                            <div className={styles.itemInfo}>
                                <a href={`/productos/${item.id}`} className={styles.itemName}>
                                    {item.nombre}
                                </a>
                                <div className={styles.itemMeta}>
                                    {item.marca && <span>{item.marca}</span>}
                                    {item.marca && item.autor && <span> • </span>}
                                    {item.autor && <span>{item.autor}</span>}
                                </div>
                                <div className={styles.itemPrice}>
                                    <span className={styles.currentPrice}>
                                        ${(item.precioConDescuento || item.precioActual || 0).toFixed(2)}
                                    </span>
                                    {item.precioConDescuento && (
                                        <span className={styles.originalPrice}>
                                            ${(item.precioActual || 0).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={styles.itemActions}>
                                <div className={styles.quantityControls}>
                                    <button
                                        className={styles.controlBtn}
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                    </button>
                                    <span className={styles.quantityDisplay}>{item.quantity}</span>
                                    <button
                                        className={styles.controlBtn}
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        disabled={item.quantity >= (item.stock || 99)}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                            <line x1="12" y1="5" x2="12" y2="19"></line>
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                    </button>
                                </div>
                                <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <aside className={styles.cartSummary}>
                    <h2 className={styles.summaryTitle}>Resumen de compra</h2>

                    <div className={styles.summaryRow}>
                        <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} productos)</span>
                        <span>${totals.subtotal.toFixed(2)}</span>
                    </div>

                    {totals.discount > 0 && (
                        <div className={`${styles.summaryRow} ${styles.discount}`}>
                            <span>Descuentos aplicados</span>
                            <span>-${totals.discount.toFixed(2)}</span>
                        </div>
                    )}

                    {totals.appliedPromotions.length > 0 && (
                        <div className={styles.appliedPromos}>
                            {totals.appliedPromotions.map((promo, idx) => (
                                <div key={idx} className={styles.promoItem}>
                                    <span>{promo.nombre}</span>
                                    <span>-${promo.monto.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>Total</span>
                        <span>${totals.total.toFixed(2)}</span>
                    </div>

                    <button className={styles.checkoutBtn} onClick={() => window.location.href = '/checkout'}>
                        Continuar compra
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </aside>
            </div>
        </div>
    );
};

export default CartView;
