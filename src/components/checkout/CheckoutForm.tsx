import React, { useState } from 'react';
import { HiOutlineUser, HiOutlineTruck } from 'react-icons/hi2';
import { MdOutlinePayment, MdCreditCard, MdAccountBalance, MdPayments } from 'react-icons/md';
import styles from './styles/CheckoutForm.module.css';

const CheckoutForm: React.FC = () => {
    const [paymentMethod, setPaymentMethod] = useState('card');

    return (
        <form className={styles.formContainer} onSubmit={(e) => e.preventDefault()}>
            {/* Section 1: Personal Info */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span><HiOutlineUser /></span> Información Personal
                </h2>
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="nombre">Nombre Completo</label>
                        <input type="text" id="nombre" className={styles.input} placeholder="Juan Pérez" required />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="email">Email</label>
                        <input type="email" id="email" className={styles.input} placeholder="juan@ejemplo.com" required />
                    </div>
                    <div className={`${styles.field} ${styles.fullWidth}`}>
                        <label className={styles.label} htmlFor="telefono">Teléfono</label>
                        <input type="tel" id="telefono" className={styles.input} placeholder="+54 11 1234-5678" required />
                    </div>
                </div>
            </div>

            {/* Section 2: Shipping */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span><HiOutlineTruck /></span> Dirección de Envío
                </h2>
                <div className={styles.grid}>
                    <div className={`${styles.field} ${styles.fullWidth}`}>
                        <label className={styles.label} htmlFor="direccion">Calle y Número</label>
                        <input type="text" id="direccion" className={styles.input} placeholder="Av. Siempre Viva 742" required />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="ciudad">Ciudad</label>
                        <input type="text" id="ciudad" className={styles.input} placeholder="CABA" required />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="provincia">Provincia</label>
                        <input type="text" id="provincia" className={styles.input} placeholder="Buenos Aires" required />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="cp">Código Postal</label>
                        <input type="text" id="cp" className={styles.input} placeholder="1425" required />
                    </div>
                </div>
            </div>

            {/* Section 3: Payment */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span><MdOutlinePayment /></span> Método de Pago
                </h2>
                <div className={styles.paymentOptions}>
                    <div
                        className={`${styles.paymentCard} ${paymentMethod === 'card' ? styles.active : ''}`}
                        onClick={() => setPaymentMethod('card')}
                    >
                        <MdCreditCard className={styles.paymentIcon} />
                        <span className={styles.paymentLabel}>Tarjeta</span>
                    </div>
                    <div
                        className={`${styles.paymentCard} ${paymentMethod === 'transfer' ? styles.active : ''}`}
                        onClick={() => setPaymentMethod('transfer')}
                    >
                        <MdAccountBalance className={styles.paymentIcon} />
                        <span className={styles.paymentLabel}>Transferencia</span>
                    </div>
                    <div
                        className={`${styles.paymentCard} ${paymentMethod === 'cash' ? styles.active : ''}`}
                        onClick={() => setPaymentMethod('cash')}
                    >
                        <MdPayments className={styles.paymentIcon} />
                        <span className={styles.paymentLabel}>Efectivo</span>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default CheckoutForm;
