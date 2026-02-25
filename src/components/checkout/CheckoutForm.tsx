import React, { useState } from 'react';
import styles from './styles/CheckoutForm.module.css';

const CheckoutForm: React.FC = () => {
    const [paymentMethod, setPaymentMethod] = useState('card');

    return (
        <form className={styles.formContainer} onSubmit={(e) => e.preventDefault()}>
            {/* Section 1: Personal Info */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span>1</span> Información Personal
                </h2>
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.label}>Nombre Completo</label>
                        <input type="text" className={styles.input} placeholder="Juan Pérez" required />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <input type="email" className={styles.input} placeholder="juan@ejemplo.com" required />
                    </div>
                    <div className={`${styles.field} ${styles.fullWidth}`}>
                        <label className={styles.label}>Teléfono</label>
                        <input type="tel" className={styles.input} placeholder="+54 11 1234-5678" required />
                    </div>
                </div>
            </div>

            {/* Section 2: Shipping */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span>2</span> Dirección de Envío
                </h2>
                <div className={styles.grid}>
                    <div className={`${styles.field} ${styles.fullWidth}`}>
                        <label className={styles.label}>Calle y Número</label>
                        <input type="text" className={styles.input} placeholder="Av. Siempre Viva 742" required />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Ciudad</label>
                        <input type="text" className={styles.input} placeholder="CABA" required />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Provincia</label>
                        <input type="text" className={styles.input} placeholder="Buenos Aires" required />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Código Postal</label>
                        <input type="text" className={styles.input} placeholder="1425" required />
                    </div>
                </div>
            </div>

            {/* Section 3: Payment */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span>3</span> Método de Pago
                </h2>
                <div className={styles.paymentOptions}>
                    <div
                        className={`${styles.paymentCard} ${paymentMethod === 'card' ? styles.active : ''}`}
                        onClick={() => setPaymentMethod('card')}
                    >
                        <span className={styles.paymentIcon}>💳</span>
                        <span className={styles.paymentLabel}>Tarjeta</span>
                    </div>
                    <div
                        className={`${styles.paymentCard} ${paymentMethod === 'transfer' ? styles.active : ''}`}
                        onClick={() => setPaymentMethod('transfer')}
                    >
                        <span className={styles.paymentIcon}>🏦</span>
                        <span className={styles.paymentLabel}>Transferencia</span>
                    </div>
                    <div
                        className={`${styles.paymentCard} ${paymentMethod === 'cash' ? styles.active : ''}`}
                        onClick={() => setPaymentMethod('cash')}
                    >
                        <span className={styles.paymentIcon}>💵</span>
                        <span className={styles.paymentLabel}>Efectivo</span>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default CheckoutForm;
