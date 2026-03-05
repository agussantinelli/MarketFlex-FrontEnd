import React from 'react';
import { LuPackage, LuX, LuCalendar, LuCreditCard, LuMapPin, LuTag } from 'react-icons/lu';
import type { AdminPurchase } from '../../types/admin.types';

interface SaleDetailModalProps {
    sale: AdminPurchase;
    onClose: () => void;
}

const SaleDetailModal: React.FC<SaleDetailModalProps> = ({ sale, onClose }) => {

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Fecha desconocida';
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'COMPLETADO': return 'var(--neon-green)';
            case 'PENDIENTE': return 'var(--warning-yellow)';
            case 'CANCELADO': return 'var(--error-red)';
            case 'PROCESANDO': return 'var(--info-blue, #3b82f6)';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div className="admin-modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
            backdropFilter: 'blur(10px)'
        }} onClick={onClose}>
            <div className="admin-modal-content" style={{
                backgroundColor: 'var(--bg-dark-secondary)',
                width: '95%',
                maxWidth: '700px',
                maxHeight: '90vh',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                animation: 'modalAppear 0.3s ease-out'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '24px 32px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(to right, rgba(0, 255, 136, 0.05), transparent)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'var(--neon-green)',
                            boxShadow: '0 0 15px rgba(0, 255, 136, 0.1)'
                        }}>
                            <LuPackage size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Detalle de Venta</h2>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', opacity: 0.8 }}>
                                ID: {sale.id.toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            padding: '10px',
                            borderRadius: '12px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                            e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                    >
                        <LuX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{
                    padding: '32px',
                    overflowY: 'auto',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '28px'
                }}>
                    {/* Top Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ESTADO</span>
                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: getStatusColor(sale.estado),
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(sale.estado) }}></span>
                                {sale.estado.toUpperCase()}
                            </span>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>TOTAL</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--neon-green)' }}>
                                ${sale.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>FECHA</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
                                <LuCalendar size={14} opacity={0.6} />
                                {formatDate(sale.fechaHora)}
                            </div>
                        </div>
                    </div>

                    {/* Customer & Shipping Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
                        <section>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <LuCreditCard size={16} /> CLIENTE Y PAGO
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                                    {sale.usuario?.nombre || 'N/A'} {sale.usuario?.apellido || ''}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    Metodo: {sale.metodoPago}
                                    {sale.cantCuotas > 1 && ` • ${sale.cantCuotas} cuotas`}
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <LuMapPin size={16} /> ENTREGA
                            </h3>
                            {sale.tipoEntrega === 'ENVIO_DOMICILIO' && sale.detalleEnvio ? (
                                <div style={{ fontSize: '0.85rem', lineHeight: '1.5', opacity: 0.9 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--neon-green)', marginBottom: '4px' }}>Envío a Domicilio</div>
                                    <div>{sale.detalleEnvio.direccion}</div>
                                    <div style={{ color: 'var(--text-muted)' }}>{sale.detalleEnvio.ciudad}, {sale.detalleEnvio.provincia}</div>
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--neon-green)', marginBottom: '4px' }}>
                                        {sale.tipoEntrega === 'RETIRO_LOCAL' ? 'Retiro en Local' :
                                            sale.tipoEntrega === 'RETIRO_SUCURSAL' ? 'Retiro en Sucursal' :
                                                sale.tipoEntrega}
                                    </div>
                                    <div style={{ fontStyle: 'italic', opacity: 0.7 }}>El cliente retira el pedido.</div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Items Table */}
                    <section>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <LuPackage size={16} /> PRODUCTOS
                        </h3>
                        <div style={{
                            backgroundColor: 'rgba(255,255,255,0.01)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            overflow: 'hidden'
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Producto</th>
                                        <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Cant.</th>
                                        <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sale.lineas.map((line, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ fontWeight: 500 }}>{line.nombreProducto}</div>
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'center', opacity: 0.7 }}>{line.cantidad}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                                                ${line.subtotal.toLocaleString('es-AR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Promotions Section */}
                    {sale.promociones && sale.promociones.length > 0 && (
                        <section>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <LuTag size={16} /> PROMOCIONES APLICADAS
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
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
                                        <span style={{ color: 'var(--neon-green)' }}>-${promo.montoDescuento.toLocaleString('es-AR')}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '24px 32px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'var(--text-muted)',
                            padding: '12px 32px',
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            letterSpacing: '0.3px'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.color = 'var(--text-main)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        Cerrar Ventana
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes modalAppear {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default SaleDetailModal;
