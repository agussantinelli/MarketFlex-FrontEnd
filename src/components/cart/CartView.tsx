import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, cartTotals, updateQuantity, removeItem, clearCart } from '../../store/cartStore';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from './styles/CartView.module.css';

const CartView: React.FC = () => {
    const items = useStore(cartItems);
    const totals = useStore(cartTotals);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simular tiempo de carga para inicialización del store persistente
        const timer = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <LoadingSpinner message="Cargando tu carrito..." />;
    }

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
                <button
                    className={styles.clearCartBtn}
                    onClick={() => {
                        if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) clearCart();
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
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
                                <div className={styles.itemMain}>
                                    <h3>{item.nombre}</h3>
                                    <div className={styles.itemPrice}>
                                        {item.precioConDescuento ? (
                                            <>
                                                <span className={styles.discountPrice}>${item.precioConDescuento.toFixed(2)}</span>
                                                <span className={styles.originalPrice}>${(item.precioActual || 0).toFixed(2)}</span>
                                            </>
                                        ) : (
                                            <span>${(item.precioActual || 0).toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.itemActions}>
                                    <div className={styles.quantityControls}>
                                        <button
                                            className={styles.controlBtn}
                                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                            disabled={item.quantity <= 1}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                            </svg>
                                        </button>
                                        <span className={styles.quantityValue}>{item.quantity}</span>
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
                                    <button className={styles.removeBtn} onClick={() => removeItem(item.id)} title="Eliminar producto">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <aside className={styles.cartSummary}>
                    <h2 className={styles.summaryTitle}>Resumen de compra</h2>

                    <div className={styles.summaryRow}>
                        <span>Subtotal (sin descuentos)</span>
                        <span>${totals.subtotal.toFixed(2)}</span>
                    </div>

                    {totals.appliedPromotions.length > 0 && (
                        <>
                            <div className={styles.summarySeparator}></div>
                            <div className={styles.summaryLabel}>Descuentos aplicados:</div>
                            <div className={styles.appliedPromos}>
                                {totals.appliedPromotions.map((promo, idx) => (
                                    <div key={idx} className={styles.promoItem}>
                                        <span>{promo.nombre}</span>
                                        <span>-${promo.monto.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <div className={styles.summarySeparator}></div>

                    <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>Monto final</span>
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
