import React, { useState, useEffect } from 'react';
import styles from './styles/RegisterSaleView.module.css';
import dashboardStyles from './styles/dashboard.module.css';
import { LuChevronLeft, LuChevronRight, LuCheck, LuArrowLeft, LuPackage, LuDollarSign, LuCreditCard, LuStore, LuTruck, LuTag, LuClock, LuCircleAlert } from 'react-icons/lu';
import { ManagementService } from '../../services/management\.service';
import type { ManagementPurchase } from '../../types/management\.types';

const ESTADO_OPTIONS = [
    { value: 'COMPLETADO', label: 'Completado', icon: LuCheck, color: 'var(--neon-green)' },
    { value: 'PENDIENTE', label: 'Pendiente', icon: LuClock, color: 'var(--warning-yellow, #f59e0b)' },
    { value: 'CANCELADO', label: 'Cancelado', icon: LuCircleAlert, color: 'var(--error-red, #f87171)' },
];

const PAYMENT_OPTIONS = [
    { value: 'Efectivo', label: 'Efectivo', icon: LuDollarSign },
    { value: 'Mercado Pago', label: 'Mercado Pago', icon: LuCreditCard },
];

const DELIVERY_OPTIONS = [
    { value: 'RETIRO_LOCAL', label: 'Retiro en Local', icon: LuStore },
    { value: 'ENVIO_DOMICILIO', label: 'Envío a Domicilio', icon: LuTruck },
];

const RAZON_PENDIENTE_OPTIONS = [
    { value: 'ENVIO_DOMICILIO', label: 'Pendiente de envío a domicilio por parte del correo -sin responsabilidad directa del local-' },
    { value: 'RETIRO_LOCAL', label: 'Pendiente de retiro por el cliente en el local' },
    { value: 'ENVIO_AL_CORREO', label: 'Pendiente de envío al correo por parte del local' },
];

const EditSaleView: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [sale, setSale] = useState<ManagementPurchase | null>(null);
    const [loading, setLoading] = useState(true);
    const [estado, setEstado] = useState('');
    const [metodoPago, setMetodoPago] = useState('');
    const [tipoEntrega, setTipoEntrega] = useState('');
    const [razonPendiente, setRazonPendiente] = useState('');
    const [shippingData, setShippingData] = useState({
        nombreCompleto: '',
        email: '',
        direccion: '',
        ciudad: '',
        provincia: '',
        codigoPostal: '',
        telefono: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const steps = [
        { id: 1, label: 'Estado de la Venta' },
        { id: 2, label: 'Pago y Entrega' },
        { id: 3, label: 'Confirmación' }
    ];

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const saleId = params.get('id');
        if (!saleId) {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'No se proporcionó un ID de venta');
            }
            setTimeout(() => { window.location.href = '/management/sales'; }, 1500);
            return;
        }

        const fetchSale = async () => {
            if ((window as any).showManagementLoader) (window as any).showManagementLoader();
            try {
                const data = await ManagementService.getPurchaseById(saleId);
                if (!data) {
                    if ((window as any).triggerSileo) {
                        (window as any).triggerSileo('error', 'Venta no encontrada');
                    }
                    setTimeout(() => { window.location.href = '/management/sales'; }, 1500);
                    return;
                }
                setSale(data);
                setEstado(data.estado);
                setMetodoPago(data.metodoPago);
                setTipoEntrega(data.tipoEntrega);
                setRazonPendiente(data.razonPendiente || '');
                if (data.detalleEnvio) {
                    setShippingData({
                        nombreCompleto: data.detalleEnvio.nombreCompleto || '',
                        email: data.detalleEnvio.email || '',
                        direccion: data.detalleEnvio.direccion || '',
                        ciudad: data.detalleEnvio.ciudad || '',
                        provincia: data.detalleEnvio.provincia || '',
                        codigoPostal: data.detalleEnvio.codigoPostal || '',
                        telefono: data.detalleEnvio.telefono || ''
                    });
                }
            } catch (err) {
                console.error(err);
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('error', 'Error al cargar la venta');
                }
            } finally {
                setLoading(false);
                if ((window as any).hideManagementLoader) (window as any).hideManagementLoader();
            }
        };
        fetchSale();
    }, []);

    const nextStep = () => {
        if (currentStep === 2 && tipoEntrega === 'ENVIO_DOMICILIO') {
            const { nombreCompleto, email, direccion, ciudad, provincia, codigoPostal, telefono } = shippingData;
            if (!nombreCompleto.trim() || !email.trim() || !direccion.trim() || !ciudad.trim() || !provincia.trim() || !codigoPostal.trim() || !telefono.trim()) {
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('error', 'Completá todos los campos de envío obligatorios');
                }
                return;
            }
        }
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };
    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        if (!sale || submitting) return;
        setSubmitting(true);
        try {
            if ((window as any).showManagementLoader) (window as any).showManagementLoader();

            const changes: { estado?: string; metodoPago?: string; tipoEntrega?: string; razonPendiente?: string; envio?: any } = {};
            if (estado !== sale.estado) changes.estado = estado;
            if (metodoPago !== sale.metodoPago) changes.metodoPago = metodoPago;
            if (tipoEntrega !== sale.tipoEntrega) changes.tipoEntrega = tipoEntrega;
            if (estado === 'PENDIENTE' && razonPendiente !== sale.razonPendiente) changes.razonPendiente = razonPendiente;

            // Simple check for shipping changes
            const shippingChanged =
                shippingData.nombreCompleto !== (sale.detalleEnvio?.nombreCompleto || '') ||
                shippingData.email !== (sale.detalleEnvio?.email || '') ||
                shippingData.direccion !== (sale.detalleEnvio?.direccion || '') ||
                shippingData.ciudad !== (sale.detalleEnvio?.ciudad || '') ||
                shippingData.provincia !== (sale.detalleEnvio?.provincia || '') ||
                shippingData.codigoPostal !== (sale.detalleEnvio?.codigoPostal || '') ||
                shippingData.telefono !== (sale.detalleEnvio?.telefono || '');

            if (shippingChanged || tipoEntrega === 'ENVIO_DOMICILIO') {
                changes.envio = shippingData;
            }

            if (Object.keys(changes).length === 0) {
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('info', 'No hay cambios para guardar');
                }
                return;
            }

            const result = await ManagementService.updatePurchase(sale.id, changes);
            if (result.status === 'success') {
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('success', '¡Venta actualizada con éxito!');
                }
                setTimeout(() => {
                    window.location.href = '/management/sales';
                }, 1500);
            } else {
                throw new Error(result.message || 'Error al actualizar la venta');
            }
        } catch (error: any) {
            console.error('Error updating sale:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', error.message || 'Error crítico al actualizar la venta');
            }
        } finally {
            setSubmitting(false);
            if ((window as any).hideManagementLoader) (window as any).hideManagementLoader();
        }
    };

    const hasChanges = sale && (
        estado !== sale.estado ||
        metodoPago !== sale.metodoPago ||
        tipoEntrega !== sale.tipoEntrega ||
        (estado === 'PENDIENTE' && razonPendiente !== sale.razonPendiente) ||
        shippingData.nombreCompleto !== (sale.detalleEnvio?.nombreCompleto || '') ||
        shippingData.email !== (sale.detalleEnvio?.email || '') ||
        shippingData.direccion !== (sale.detalleEnvio?.direccion || '') ||
        shippingData.ciudad !== (sale.detalleEnvio?.ciudad || '') ||
        shippingData.provincia !== (sale.detalleEnvio?.provincia || '') ||
        shippingData.codigoPostal !== (sale.detalleEnvio?.codigoPostal || '') ||
        shippingData.telefono !== (sale.detalleEnvio?.telefono || '')
    );

    const renderStep = () => {
        if (!sale) return null;

        switch (currentStep) {
            case 1:
                return (
                    <div className={styles.stepContent}>
                        <h4 className={styles.sectionLabel}>Estado Actual</h4>
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(0, 255, 136, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 255, 136, 0.1)',
                            marginBottom: '2rem',
                            fontSize: '0.9rem',
                            color: 'var(--green-cream)',
                            opacity: 0.7
                        }}>
                            Estado original: <strong style={{ color: 'var(--neon-green)', opacity: 1 }}>{sale.estado}</strong>
                        </div>

                        <h4 className={styles.sectionLabel}>Nuevo Estado</h4>
                        <div className={styles.selectionGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            {ESTADO_OPTIONS.map((opt, index) => {
                                const Icon = opt.icon;
                                const isLastCentered = ESTADO_OPTIONS.length % 2 !== 0 && index === ESTADO_OPTIONS.length - 1;
                                return (
                                    <div
                                        key={opt.value}
                                        className={`${styles.selectionTile} ${estado === opt.value ? styles.active : ''}`}
                                        onClick={() => setEstado(opt.value)}
                                        style={{
                                            ...(estado === opt.value ? { borderColor: opt.color } : {}),
                                            ...(isLastCentered ? { gridColumn: 'span 2', justifySelf: 'center', width: '50%' } : {})
                                        }}
                                    >
                                        <Icon className={styles.tileIcon} style={{ color: opt.color }} />
                                        <span className={styles.tileLabel}>{opt.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {estado === 'CANCELADO' && sale.estado !== 'CANCELADO' && (
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: 'rgba(248, 113, 113, 0.1)',
                                borderRadius: '12px',
                                border: '1px solid rgba(248, 113, 113, 0.2)',
                                color: 'var(--error-red, #f87171)',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <LuCircleAlert size={18} />
                                Al cancelar esta venta, el stock de los productos será repuesto automáticamente.
                            </div>
                        )}

                        {estado === 'PENDIENTE' && (
                            <div style={{ marginTop: '2.5rem' }}>
                                <h4 className={styles.sectionLabel}>Razón Logística (Pendiente)</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {RAZON_PENDIENTE_OPTIONS.map(opt => (
                                        <div
                                            key={opt.value}
                                            onClick={() => setRazonPendiente(opt.value)}
                                            style={{
                                                padding: '1rem',
                                                background: razonPendiente === opt.value ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.03)',
                                                borderRadius: '12px',
                                                border: '1px solid',
                                                borderColor: razonPendiente === opt.value ? 'var(--warning-yellow)' : 'rgba(255,255,255,0.08)',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                transition: 'all 0.2s',
                                                color: razonPendiente === opt.value ? 'var(--warning-yellow)' : 'var(--green-cream)'
                                            }}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 2:
                return (
                    <div className={styles.stepContent}>
                        <h4 className={styles.sectionLabel}>Método de Pago</h4>
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(0, 255, 136, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 255, 136, 0.1)',
                            marginBottom: '2rem',
                            fontSize: '0.9rem',
                            color: 'var(--green-cream)',
                            opacity: 0.7
                        }}>
                            Método original: <strong style={{ color: 'var(--neon-green)', opacity: 1 }}>
                                {sale.metodoPago}
                            </strong>
                        </div>

                        <h4 className={styles.sectionLabel}>Nuevo Método de Pago</h4>
                        <div className={styles.selectionGrid} style={{ marginBottom: '2rem' }}>
                            {PAYMENT_OPTIONS.map(opt => {
                                const Icon = opt.icon;
                                return (
                                    <div
                                        key={opt.value}
                                        className={`${styles.selectionTile} ${metodoPago === opt.value ? styles.active : ''}`}
                                        onClick={() => setMetodoPago(opt.value)}
                                    >
                                        <Icon className={styles.tileIcon} />
                                        <span className={styles.tileLabel}>{opt.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <h4 className={styles.sectionLabel}>Método de Entrega</h4>
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(0, 255, 136, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 255, 136, 0.1)',
                            marginBottom: '2rem',
                            fontSize: '0.9rem',
                            color: 'var(--green-cream)',
                            opacity: 0.7
                        }}>
                            Método original: <strong style={{ color: 'var(--neon-green)', opacity: 1 }}>
                                {DELIVERY_OPTIONS.find(opt => opt.value === sale.tipoEntrega)?.label || sale.tipoEntrega}
                            </strong>
                        </div>

                        <h4 className={styles.sectionLabel}>Nuevo Método de Entrega</h4>
                        <div className={styles.selectionGrid}>
                            {DELIVERY_OPTIONS.map(opt => {
                                const Icon = opt.icon;
                                return (
                                    <div
                                        key={opt.value}
                                        className={`${styles.selectionTile} ${tipoEntrega === opt.value ? styles.active : ''}`}
                                        onClick={() => setTipoEntrega(opt.value)}
                                    >
                                        <Icon className={styles.tileIcon} />
                                        <span className={styles.tileLabel}>{opt.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{
                            marginTop: '2rem',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem'
                        }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Nombre Completo {tipoEntrega === 'ENVIO_DOMICILIO' && <span style={{ color: 'var(--error-red)' }}>*</span>}
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nombre y Apellido"
                                    value={shippingData.nombreCompleto}
                                    onChange={(e) => setShippingData(prev => ({ ...prev, nombreCompleto: e.target.value }))}
                                    className={dashboardStyles.toggleBtn}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '0.85rem 1rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Email {tipoEntrega === 'ENVIO_DOMICILIO' && <span style={{ color: 'var(--error-red)' }}>*</span>}
                                </label>
                                <input
                                    type="email"
                                    placeholder="email@ejemplo.com"
                                    value={shippingData.email}
                                    onChange={(e) => setShippingData(prev => ({ ...prev, email: e.target.value }))}
                                    className={dashboardStyles.toggleBtn}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '0.85rem 1rem' }}
                                />
                            </div>
                            <div style={{ gridColumn: tipoEntrega === 'ENVIO_DOMICILIO' ? 'auto' : '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Teléfono {tipoEntrega === 'ENVIO_DOMICILIO' && <span style={{ color: 'var(--error-red)' }}>*</span>}
                                </label>
                                <input
                                    type="text"
                                    placeholder="Teléfono de contacto"
                                    value={shippingData.telefono}
                                    onChange={(e) => setShippingData(prev => ({ ...prev, telefono: e.target.value }))}
                                    className={dashboardStyles.toggleBtn}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '0.85rem 1rem' }}
                                />
                            </div>
                        </div>

                        {tipoEntrega === 'ENVIO_DOMICILIO' ? (
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: 'rgba(0, 255, 136, 0.05)',
                                borderRadius: '12px',
                                border: '1px solid rgba(0, 255, 136, 0.1)',
                                color: 'var(--green-cream)',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <LuTruck style={{ color: 'var(--neon-green)' }} />
                                Modificá los datos de envío del cliente a continuación.
                            </div>
                        ) : (
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: 'rgba(245, 158, 11, 0.05)',
                                borderRadius: '12px',
                                border: '1px solid rgba(245, 158, 11, 0.1)',
                                color: 'var(--warning-yellow)',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <LuStore style={{ color: 'var(--warning-yellow)' }} />
                                El pedido es para retiro. Los datos de contacto son opcionales.
                            </div>
                        )}

                        {tipoEntrega === 'ENVIO_DOMICILIO' && (
                            <div style={{
                                marginTop: '2rem',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem'
                            }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dirección</label>
                                    <input
                                        type="text"
                                        placeholder="Calle y número"
                                        value={shippingData.direccion}
                                        onChange={(e) => setShippingData(prev => ({ ...prev, direccion: e.target.value }))}
                                        className={dashboardStyles.toggleBtn}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '0.85rem 1rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ciudad</label>
                                    <input
                                        type="text"
                                        placeholder="Ciudad"
                                        value={shippingData.ciudad}
                                        onChange={(e) => setShippingData(prev => ({ ...prev, ciudad: e.target.value }))}
                                        className={dashboardStyles.toggleBtn}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '0.85rem 1rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Provincia</label>
                                    <input
                                        type="text"
                                        placeholder="Provincia"
                                        value={shippingData.provincia}
                                        onChange={(e) => setShippingData(prev => ({ ...prev, provincia: e.target.value }))}
                                        className={dashboardStyles.toggleBtn}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '0.85rem 1rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Código Postal</label>
                                    <input
                                        type="text"
                                        placeholder="CP"
                                        value={shippingData.codigoPostal}
                                        onChange={(e) => setShippingData(prev => ({ ...prev, codigoPostal: e.target.value }))}
                                        className={dashboardStyles.toggleBtn}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '0.85rem 1rem' }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.summaryCard} style={{ marginTop: '2rem' }}>
                            <h4 style={{
                                color: 'var(--neon-green)',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                marginBottom: '1rem',
                                opacity: 0.8
                            }}>Resumen de Productos</h4>
                            {sale.lineas.map((linea, idx) => (
                                <div key={idx} className={styles.summaryRow}>
                                    <span className={styles.summaryLabel}>
                                        {linea.nombreProducto} <span style={{ opacity: 0.5 }}>x{linea.cantidad}</span>
                                    </span>
                                    <span className={styles.summaryValue}>${linea.subtotal.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Total</span>
                                <span className={styles.summaryTotal}>${sale.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className={styles.stepContent}>
                        <h4 className={styles.sectionLabel}>Confirmar Cambios</h4>

                        <div className={styles.summaryCard} style={{ marginTop: '0', marginBottom: '2rem' }}>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Estado</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {estado !== sale.estado ? (
                                        <>
                                            <span style={{ opacity: 0.4, textDecoration: 'line-through' }}>{sale.estado}</span>
                                            <span style={{ opacity: 0.4 }}>→</span>
                                            <span style={{
                                                color: ESTADO_OPTIONS.find(o => o.value === estado)?.color,
                                                fontWeight: 700
                                            }}>{estado}</span>
                                        </>
                                    ) : (
                                        <span className={styles.summaryValue} style={{ opacity: 0.5 }}>{sale.estado} (sin cambios)</span>
                                    )}
                                </div>
                            </div>
                            {estado === 'PENDIENTE' && (
                                <div className={styles.summaryRow}>
                                    <span className={styles.summaryLabel}>Razón Logística</span>
                                    <span className={styles.summaryValue} style={{ color: 'var(--warning-yellow)', fontSize: '0.8rem', textAlign: 'right' }}>
                                        {RAZON_PENDIENTE_OPTIONS.find(o => o.value === razonPendiente)?.label || razonPendiente}
                                    </span>
                                </div>
                            )}
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Método de Pago</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {metodoPago !== sale.metodoPago ? (
                                        <>
                                            <span style={{ opacity: 0.4, textDecoration: 'line-through' }}>
                                                {sale.metodoPago}
                                            </span>
                                            <span style={{ opacity: 0.4 }}>→</span>
                                            <span style={{ color: 'var(--neon-green)', fontWeight: 700 }}>
                                                {metodoPago}
                                            </span>
                                        </>
                                    ) : (
                                        <span className={styles.summaryValue} style={{ opacity: 0.5 }}>
                                            {sale.metodoPago} (sin cambios)
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Método de Entrega</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {tipoEntrega !== sale.tipoEntrega ? (
                                        <>
                                            <span style={{ opacity: 0.4, textDecoration: 'line-through' }}>
                                                {DELIVERY_OPTIONS.find(o => o.value === sale.tipoEntrega)?.label || sale.tipoEntrega}
                                            </span>
                                            <span style={{ opacity: 0.4 }}>→</span>
                                            <span style={{ color: 'var(--neon-green)', fontWeight: 700 }}>
                                                {DELIVERY_OPTIONS.find(o => o.value === tipoEntrega)?.label || tipoEntrega}
                                            </span>
                                        </>
                                    ) : (
                                        <span className={styles.summaryValue} style={{ opacity: 0.5 }}>
                                            {DELIVERY_OPTIONS.find(o => o.value === sale.tipoEntrega)?.label || sale.tipoEntrega} (sin cambios)
                                        </span>
                                    )}
                                </div>
                            </div>
                            {(tipoEntrega === 'ENVIO_DOMICILIO' || sale.detalleEnvio) && (
                                <div className={styles.summaryRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                                    <span className={styles.summaryLabel} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                        <LuTruck size={14} style={{ color: 'var(--neon-green)' }} /> Datos de Envío
                                    </span>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.6, paddingLeft: '20px' }}>
                                        <div style={{ fontWeight: 600, opacity: 1 }}>{shippingData.nombreCompleto}</div>
                                        <div>{shippingData.email}</div>
                                        <div>{shippingData.direccion}</div>
                                        <div>{shippingData.ciudad}, {shippingData.provincia} ({shippingData.codigoPostal})</div>
                                        <div>Tel: {shippingData.telefono}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <h4 className={styles.sectionLabel} style={{ fontSize: '0.9rem', opacity: 0.7 }}>Items de la Venta</h4>
                        <div className={styles.selectedList} style={{ gap: '0.5rem' }}>
                            {sale.lineas.map((linea, idx) => (
                                <div key={idx} className={styles.productCard} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.01)' }}>
                                    <div className={styles.productImage} style={{ width: '40px', height: '40px' }}>
                                        <div className={styles.productImagePlaceholder}>
                                            <LuPackage size={16} />
                                        </div>
                                    </div>
                                    <div className={styles.productInfo}>
                                        <span className={styles.productName} style={{ fontSize: '0.85rem' }}>{linea.nombreProducto}</span>
                                        <span className={styles.productPrice} style={{ fontSize: '0.75rem', opacity: 0.6 }}>${(linea.subtotal / linea.cantidad).toLocaleString()} c/u</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: 'var(--neon-green)', fontWeight: 700, fontSize: '0.9rem' }}>
                                            ${linea.subtotal.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Cant: {linea.cantidad}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {sale.promociones && sale.promociones.length > 0 && (
                            <>
                                <h4 className={styles.sectionLabel} style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '1.5rem' }}>
                                    <LuTag size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                    Promociones Aplicadas
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1.5rem' }}>
                                    {sale.promociones.map((promo, idx) => (
                                        <div key={idx} style={{
                                            backgroundColor: 'rgba(0, 255, 136, 0.08)',
                                            padding: '8px 14px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(0, 255, 136, 0.15)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '0.8rem'
                                        }}>
                                            <span style={{ fontWeight: 600, color: 'var(--neon-green)' }}>{promo.nombre}</span>
                                            <span style={{ opacity: 0.6 }}>|</span>
                                            <span style={{ color: 'var(--neon-green)' }}>-${promo.montoDescuento.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className={styles.summaryCard} style={{ marginTop: '2rem', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
                            <div className={styles.summaryRow} style={{ borderBottom: 'none', padding: '0' }}>
                                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--green-cream)' }}>TOTAL FINAL</span>
                                <span className={styles.summaryTotal} style={{ fontSize: '2rem' }}>
                                    ${sale.total.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {!hasChanges && (
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '12px',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                color: 'var(--warning-yellow, #f59e0b)',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <LuCircleAlert size={18} />
                                No hay cambios para guardar. Modifica al menos un campo para continuar.
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) return null;

    return (
        <div className={dashboardStyles.dashboardContainer} style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem 2rem' }}>
            <header className={dashboardStyles.header} style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.75rem' }}>
                    <a
                        href="/management/sales"
                        className={dashboardStyles.actionBtn}
                        title="Volver a Ventas"
                        style={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'var(--neon-green)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <LuArrowLeft size={20} />
                    </a>
                    <h1 style={{
                        margin: 0,
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        color: 'var(--neon-green)',
                        letterSpacing: '-1px'
                    }}>
                        Editar Venta
                    </h1>
                </div>
                <p style={{
                    fontSize: '1.1rem',
                    color: 'var(--green-cream)',
                    opacity: 0.7,
                    marginLeft: '3.75rem'
                }}>
                    Modifica el estado y método de pago de la venta seleccionada.
                </p>
            </header>

            <div className={styles.viewContainer}>
                <div className={styles.stepper}>
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`${styles.step} ${currentStep === step.id ? styles.active : ''} ${currentStep > step.id ? styles.completed : ''}`}
                        >
                            <div className={styles.stepCircle}>
                                {currentStep > step.id ? <LuCheck /> : step.id}
                            </div>
                            <div className={styles.stepLabelContainer}>
                                <span className={styles.stepNumber}>0{step.id}</span>
                                <span className={styles.stepLabel}>{step.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.divider} />

                {renderStep()}

                <div className={styles.actions}>
                    {currentStep > 1 && (
                        <button onClick={prevStep} className={dashboardStyles.btnSecondary}>
                            <LuChevronLeft /> Anterior
                        </button>
                    )}
                    <div style={{ marginLeft: 'auto' }}>
                        {currentStep < 3 ? (
                            <button
                                onClick={nextStep}
                                className={dashboardStyles.btnPrimary}
                            >
                                Siguiente <LuChevronRight />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className={dashboardStyles.btnPrimary}
                                disabled={!hasChanges || submitting}
                            >
                                <LuCheck /> Guardar Cambios
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditSaleView;
