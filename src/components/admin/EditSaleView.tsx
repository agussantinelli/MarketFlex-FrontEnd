import React, { useState, useEffect } from 'react';
import styles from './styles/RegisterSaleView.module.css';
import dashboardStyles from './styles/dashboard.module.css';
import { LuChevronLeft, LuChevronRight, LuCheck, LuArrowLeft, LuPackage, LuDollarSign, LuCreditCard, LuRepeat, LuStore, LuTruck, LuTag, LuClock, LuCircleAlert } from 'react-icons/lu';
import { AdminService } from '../../services/admin.service';
import type { AdminPurchase } from '../../types/admin.types';

const ESTADO_OPTIONS = [
    { value: 'COMPLETADO', label: 'Completado', icon: LuCheck, color: 'var(--neon-green)' },
    { value: 'PENDIENTE', label: 'Pendiente', icon: LuClock, color: 'var(--warning-yellow, #f59e0b)' },
    { value: 'CANCELADO', label: 'Cancelado', icon: LuCircleAlert, color: 'var(--error-red, #f87171)' },
];

const PAYMENT_OPTIONS = [
    { value: 'cash', label: 'Efectivo', icon: LuDollarSign },
    { value: 'card', label: 'Tarjeta', icon: LuCreditCard },
    { value: 'transfer', label: 'Transferencia', icon: LuRepeat },
];

const EditSaleView: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [sale, setSale] = useState<AdminPurchase | null>(null);
    const [loading, setLoading] = useState(true);
    const [estado, setEstado] = useState('');
    const [metodoPago, setMetodoPago] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const steps = [
        { id: 1, label: 'Estado de la Venta' },
        { id: 2, label: 'Método de Pago' },
        { id: 3, label: 'Confirmación' }
    ];

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const saleId = params.get('id');
        if (!saleId) {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'No se proporcionó un ID de venta');
            }
            setTimeout(() => { window.location.href = '/admin/sales'; }, 1500);
            return;
        }

        const fetchSale = async () => {
            if ((window as any).showAdminLoader) (window as any).showAdminLoader();
            try {
                const data = await AdminService.getPurchaseById(saleId);
                if (!data) {
                    if ((window as any).triggerSileo) {
                        (window as any).triggerSileo('error', 'Venta no encontrada');
                    }
                    setTimeout(() => { window.location.href = '/admin/sales'; }, 1500);
                    return;
                }
                setSale(data);
                setEstado(data.estado);
                setMetodoPago(data.metodoPago);
            } catch (err) {
                console.error(err);
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('error', 'Error al cargar la venta');
                }
            } finally {
                setLoading(false);
                if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
            }
        };
        fetchSale();
    }, []);

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };
    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        if (!sale || submitting) return;
        setSubmitting(true);
        try {
            if ((window as any).showAdminLoader) (window as any).showAdminLoader();

            const changes: { estado?: string; metodoPago?: string } = {};
            if (estado !== sale.estado) changes.estado = estado;
            if (metodoPago !== sale.metodoPago) changes.metodoPago = metodoPago;

            if (Object.keys(changes).length === 0) {
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('info', 'No hay cambios para guardar');
                }
                return;
            }

            const result = await AdminService.updatePurchase(sale.id, changes);
            if (result.status === 'success') {
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('success', '¡Venta actualizada con éxito!');
                }
                setTimeout(() => {
                    window.location.href = '/admin/sales';
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
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
        }
    };

    const hasChanges = sale && (estado !== sale.estado || metodoPago !== sale.metodoPago);

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
                    </div>
                );

            case 2:
                return (
                    <div className={styles.stepContent}>
                        <h4 className={styles.sectionLabel}>Método de Pago Actual</h4>
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
                                {sale.metodoPago === 'cash' ? 'Efectivo' : sale.metodoPago === 'card' ? 'Tarjeta' : 'Transferencia'}
                            </strong>
                        </div>

                        <h4 className={styles.sectionLabel}>Nuevo Método de Pago</h4>
                        <div className={styles.selectionGrid}>
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
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Método de Pago</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {metodoPago !== sale.metodoPago ? (
                                        <>
                                            <span style={{ opacity: 0.4, textDecoration: 'line-through' }}>
                                                {sale.metodoPago === 'cash' ? 'Efectivo' : sale.metodoPago === 'card' ? 'Tarjeta' : 'Transferencia'}
                                            </span>
                                            <span style={{ opacity: 0.4 }}>→</span>
                                            <span style={{ color: 'var(--neon-green)', fontWeight: 700 }}>
                                                {metodoPago === 'cash' ? 'Efectivo' : metodoPago === 'card' ? 'Tarjeta' : 'Transferencia'}
                                            </span>
                                        </>
                                    ) : (
                                        <span className={styles.summaryValue} style={{ opacity: 0.5 }}>
                                            {sale.metodoPago === 'cash' ? 'Efectivo' : sale.metodoPago === 'card' ? 'Tarjeta' : 'Transferencia'} (sin cambios)
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Tipo</span>
                                <span className={styles.summaryValue} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {sale.ventaEnFisico ? <><LuStore size={14} /> Presencial</> : <><LuTruck size={14} /> Envío</>}
                                </span>
                            </div>
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
                        href="/admin/sales"
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
