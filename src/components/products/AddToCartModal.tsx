import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './styles/AddToCartModal.module.css';
import { addItem } from '../../store/cartStore';
import type { Product } from '../../types/product.types';

interface AddToCartModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    onConfirm?: (quantity: number) => void;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({
    isOpen,
    onClose,
    product,
    onConfirm
}) => {
    const [quantity, setQuantity] = useState(1);
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    const productId = product.id;
    const productName = product.nombre;
    const productPrice = product.precioConDescuento || product.precioActual || 0;

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            // Un pequeño delay para que la transición CSS se active correctamente
            const timer = setTimeout(() => setIsVisible(true), 10);
            document.body.style.overflow = 'hidden';
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            document.body.style.overflow = 'unset';
            return undefined;
        }
    }, [isOpen]);

    // Importante: No renderizar nada en el servidor o si no está abierto
    if (!mounted || (!isOpen && !isVisible)) return null;

    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => setQuantity(prev => Math.max(1, prev - 1));

    const subtotal = (productPrice * quantity).toFixed(2);

    const handleAddToCart = () => {
        const result = addItem(product, quantity);

        // @ts-ignore - Sileo is injected globally
        if (window.triggerSileo) {
            if (result && !result.success) {
                // @ts-ignore
                window.triggerSileo("error", result.message);
                return;
            }

            if (onConfirm) onConfirm(quantity);
            const message = quantity === 1
                ? `¡Hecho! Agregaste 1 unidad de "${productName}" al carrito. ✨`
                : `¡Excelente! Agregaste ${quantity} unidades de "${productName}" a tu bolsa. 🛍️`;

            // @ts-ignore
            window.triggerSileo("success", message);
        }
        onClose();
    };

    const modalLayout = (
        <div
            className={`${styles.modalOverlay} ${isVisible ? styles.modalOverlayVisible : ''}`}
            onClick={onClose}
        >
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h2 className={styles.productName}>{productName}</h2>
                </div>

                <div className={styles.quantitySection}>
                    <div className={styles.quantityControls}>
                        <button
                            className={styles.controlBtn}
                            onClick={handleDecrement}
                            disabled={quantity <= 1}
                            aria-label="Disminuir cantidad"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>

                        <span className={styles.quantityDisplay}>{quantity}</span>

                        <button
                            className={styles.controlBtn}
                            onClick={handleIncrement}
                            aria-label="Aumentar cantidad"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>

                    <div className={styles.subtotalContainer}>
                        <span className={styles.subtotalLabel}>Subtotal estimado</span>
                        <div className={styles.subtotalValue}>
                            ${subtotal}
                            {product.precioConDescuento && (
                                <span className={styles.originalSubtotal}>
                                    ${((product.precioActual || 0) * quantity).toFixed(2)}
                                </span>
                            )}
                        </div>
                        {product.precioConDescuento && (
                            <div className={styles.savingsLabel}>
                                Monto ahorrado: <span>${(((product.precioActual || 0) - (product.precioConDescuento || 0)) * quantity).toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.btnAgregar} onClick={handleAddToCart}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Confirmar y Agregar
                    </button>

                    <div className={styles.primaryActions}>
                        <button className={`${styles.btn} ${styles.btnSalir}`} onClick={onClose}>
                            Salir
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnVerMas}`}
                            onClick={() => window.location.href = `/productos/${productId}`}
                        >
                            Ver detalle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalLayout, document.body);
};

export default AddToCartModal;
