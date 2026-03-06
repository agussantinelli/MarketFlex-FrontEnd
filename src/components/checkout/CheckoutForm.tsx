import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { HiOutlineUser, HiOutlineTruck, HiExclamationCircle } from 'react-icons/hi2';
import { MdOutlinePayment, MdCreditCard, MdPayments } from 'react-icons/md';
import styles from './styles/CheckoutForm.module.css';
import { checkoutStore, updateFormData, updatePaymentMethod, updateDeliveryType } from '../../store/checkoutStore';
import { UserService } from '../../services/user.service';

const CheckoutForm: React.FC = () => {
    const { formData, paymentMethod, tipoEntrega, error } = useStore(checkoutStore);

    useEffect(() => {
        const fetchInitialData = async () => {
            // 1. Initial pre-fill from localStorage (fast)
            const userStr = localStorage.getItem('marketflex_user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    syncUserToForm(user);
                } catch (e) { }
            }

            // 2. Refresh from API (robust)
            try {
                const freshUser = await UserService.getProfile();
                syncUserToForm(freshUser);
            } catch (err) {
                console.error("Error refreshing profile for checkout", err);
            }
        };

        const syncUserToForm = (user: any) => {
            updateFormData({
                nombre: user.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : '',
                email: user.email || '',
                ciudad: user.ciudad || user.ciudadResidencia || '',
                cp: user.codigoPostal || '',
                telefono: user.telefono || '',
                direccion: user.direccion || '',
                provincia: user.provincia || ''
            });
        };

        fetchInitialData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        updateFormData({ [id]: value });
    };

    const handlePaymentChange = (method: 'Mercado Pago' | 'Efectivo') => {
        updatePaymentMethod(method);
    };

    return (
        <form className={styles.formContainer} onSubmit={(e) => e.preventDefault()}>
            {error && (
                <div className={styles.errorAlert}>
                    <HiExclamationCircle />
                    <span>{error}</span>
                </div>
            )}
            {/* Section 1: Personal Info */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span><HiOutlineUser /></span> Información Personal
                </h2>
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="nombre">Nombre Completo</label>
                        <input
                            type="text"
                            id="nombre"
                            className={styles.input}
                            placeholder="Juan Pérez"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className={styles.input}
                            placeholder="juan@ejemplo.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={`${styles.field} ${styles.fullWidth}`}>
                        <label className={styles.label} htmlFor="telefono">Teléfono</label>
                        <input
                            type="tel"
                            id="telefono"
                            className={styles.input}
                            placeholder="+54 11 1234-5678"
                            value={formData.telefono}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: Shipping / Delivery */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span><HiOutlineTruck /></span> Medio de Entrega
                </h2>
                <div className={styles.paymentOptions} style={{ marginBottom: '1.5rem' }}>
                    <div
                        className={`${styles.paymentCard} ${tipoEntrega === 'ENVIO_DOMICILIO' ? styles.active : ''}`}
                        onClick={() => updateDeliveryType('ENVIO_DOMICILIO')}
                    >
                        <HiOutlineTruck className={styles.paymentIcon} />
                        <span className={styles.paymentLabel}>Envío a Domicilio</span>
                    </div>
                    <div
                        className={`${styles.paymentCard} ${tipoEntrega === 'RETIRO_LOCAL' ? styles.active : ''}`}
                        onClick={() => updateDeliveryType('RETIRO_LOCAL')}
                    >
                        <HiOutlineUser className={styles.paymentIcon} />
                        <span className={styles.paymentLabel}>Retiro en Local</span>
                    </div>
                </div>

                {tipoEntrega === 'RETIRO_LOCAL' && (
                    <div style={{ padding: '1.5rem', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '12px', marginTop: '1rem' }}>
                        <h4 style={{ color: 'var(--neon-green)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Retiro por nuestra sucursal</h4>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Te esperamos en <strong>Av. del Libertador 1234, CABA</strong> de Lunes a Viernes de 9hs a 18hs para retirar tu compra con tu número de pedido y DNI.
                        </p>
                    </div>
                )}

                {tipoEntrega === 'ENVIO_DOMICILIO' && (
                    <div className={styles.grid}>
                        <div className={`${styles.field} ${styles.fullWidth}`}>
                            <label className={styles.label} htmlFor="direccion">Calle y Número</label>
                            <input
                                type="text"
                                id="direccion"
                                className={styles.input}
                                placeholder="Av. Siempre Viva 742"
                                value={formData.direccion}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="ciudad">Ciudad</label>
                            <input
                                type="text"
                                id="ciudad"
                                className={styles.input}
                                placeholder="CABA"
                                value={formData.ciudad}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="provincia">Provincia</label>
                            <input
                                type="text"
                                id="provincia"
                                className={styles.input}
                                placeholder="Buenos Aires"
                                value={formData.provincia}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="cp">Código Postal</label>
                            <input
                                type="text"
                                id="cp"
                                className={styles.input}
                                placeholder="1425"
                                value={formData.cp}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Section 3: Payment */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span><MdOutlinePayment /></span> Método de Pago
                </h2>
                <div className={styles.paymentOptions}>
                    <div
                        className={`${styles.paymentCard} ${paymentMethod === 'Mercado Pago' ? styles.active : ''}`}
                        onClick={() => handlePaymentChange('Mercado Pago')}
                    >
                        <MdCreditCard className={styles.paymentIcon} />
                        <span className={styles.paymentLabel}>Mercado Pago</span>
                    </div>
                    <div
                        className={`${styles.paymentCard} ${paymentMethod === 'Efectivo' ? styles.active : ''}`}
                        onClick={() => handlePaymentChange('Efectivo')}
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
