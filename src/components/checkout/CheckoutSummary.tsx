import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { HiArrowRight, HiOutlineShoppingBag } from 'react-icons/hi2';
import { cartItems, cartTotals } from '../../store/cartStore';
import { checkoutStore, submitPurchase, resetCheckout } from '../../store/checkoutStore';
import styles from './styles/CheckoutSummary.module.css';

const CheckoutSummary: React.FC = () => {
    const items = useStore(cartItems);
    const totals = useStore(cartTotals);
    const { isSubmitting, success, error } = useStore(checkoutStore);

    // Reset checkout on unmount to avoid stale success state
    useEffect(() => {
        return () => resetCheckout();
    }, []);

    if (success) {
        return (
            <div className={`${styles.summaryContainer} ${styles.success}`}>
                <div className={styles.successIcon}>✅</div>
                <h2 className={styles.title}>¡Pedido Recibido!</h2>
                <p className={styles.successMessage}>Gracias por tu compra. Pronto recibirás un email con los detalles.</p>
                <div className={styles.successDetails}>
                    <p>Monto Pagado: <strong>${useStore(checkoutStore).lastOrderTotal.toLocaleString()}</strong></p>
                </div>
                <a href="/" className={styles.checkoutBtn}>Volver a la Tienda</a>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className={styles.summaryContainer}>
                <h2 className={styles.title}>Resumen del Pedido</h2>
                <div className={styles.emptyContainer}>
                    <HiOutlineShoppingBag className={styles.emptyIcon} />
                    <p className={styles.emptyMessage}>No hay productos en tu carrito.</p>
                    <a href="/search" className={styles.emptyLink}>Ir a la tienda</a>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.summaryContainer}>
            <h2 className={styles.title}>Resumen del Pedido</h2>

            <div className={styles.itemList}>
                {items.map((item) => (
                    <div key={item.id} className={styles.item}>
                        <img
                            src={item.foto ? `http://localhost:5979/${item.foto}` : '/placeholder-product.png'}
                            alt={item.nombre}
                            className={styles.image}
                        />
                        <div className={styles.itemInfo}>
                            <span className={styles.itemName}>{item.nombre}</span>
                            <span className={styles.itemMeta}>Cant: {item.quantity}</span>
                            {item.promocionActiva && (
                                <span className={styles.promoTag}>{item.promocionActiva.nombre}</span>
                            )}
                        </div>
                        <span className={styles.itemPrice}>
                            ${(Number(item.precioActual) * item.quantity).toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>

            <div className={styles.totals}>
                <div className={styles.row}>
                    <span>Subtotal</span>
                    <span>${totals.subtotal.toLocaleString()}</span>
                </div>

                {totals.appliedPromotions.map((promo, idx) => (
                    <div key={idx} className={`${styles.row} ${styles.discount}`}>
                        <span>{promo.nombre}</span>
                        <span>-${promo.monto.toLocaleString()}</span>
                    </div>
                ))}

                <div className={`${styles.row} ${styles.total}`}>
                    <span>Total</span>
                    <span>${totals.total.toLocaleString()}</span>
                </div>
            </div>

            <button
                className={`${styles.checkoutBtn} ${isSubmitting ? styles.loading : ''}`}
                onClick={submitPurchase}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Procesando...' : 'Confirmar Compra'}
                {!isSubmitting && <HiArrowRight />}
            </button>

            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default CheckoutSummary;
