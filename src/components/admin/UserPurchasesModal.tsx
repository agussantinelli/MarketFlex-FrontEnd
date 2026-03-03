import React, { useEffect, useState } from 'react';
import { LuPackage, LuX, LuCalendar, LuCreditCard } from 'react-icons/lu';
import { AdminService } from '../../services/admin.service';
import type { AdminPurchase } from '../../types/admin.types';

interface UserPurchasesModalProps {
    userId: string;
    userName: string;
    onClose: () => void;
}

const UserPurchasesModal: React.FC<UserPurchasesModalProps> = ({ userId, userName, onClose }) => {
    const [purchases, setPurchases] = useState<AdminPurchase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPurchases = async () => {
            const data = await AdminService.getUserPurchases(userId);
            setPurchases(data);
            setLoading(false);
        };
        fetchPurchases();
    }, [userId]);

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
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(8px)'
        }} onClick={onClose}>
            <div className="admin-modal-content" style={{
                backgroundColor: 'var(--bg-dark-secondary)',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '85vh',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'var(--neon-green)'
                        }}>
                            <LuPackage size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Compras de {userName}</h2>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Historial de transacciones</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            padding: '8px',
                            borderRadius: '50%',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                        <LuX size={24} />
                    </button>
                </div>

                {/* Body */}
                <div style={{
                    padding: '24px',
                    overflowY: 'auto',
                    flex: 1
                }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                            <div className="admin-spinner"></div>
                        </div>
                    ) : purchases.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                            <LuPackage size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                            <p>Este usuario aún no ha realizado ninguna compra.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {purchases.map((purchase) => (
                                <div key={purchase.id} style={{
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    padding: '20px',
                                    transition: 'transform 0.2s',
                                    cursor: 'default'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                ID: {purchase.id?.split('-')[0]?.toUpperCase()}...
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <LuCalendar size={14} color="var(--text-muted)" />
                                                <span style={{ fontSize: '0.875rem' }}>{formatDate(purchase.fechaHora)}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                backgroundColor: `${getStatusColor(purchase.estado)}15`,
                                                color: getStatusColor(purchase.estado),
                                                border: `1px solid ${getStatusColor(purchase.estado)}30`
                                            }}>
                                                {purchase.estado}
                                            </span>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--neon-green)' }}>
                                                ${purchase.total.toLocaleString('es-AR')}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        borderTop: '1px dashed rgba(255,255,255,0.1)',
                                        paddingTop: '12px'
                                    }}>
                                        <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '8px' }}>Productos:</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {purchase.lineas.map((line, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                                    <span style={{ color: 'var(--text-main)', opacity: 0.9 }}>
                                                        {line.cantidad}x {line.nombreProducto}
                                                    </span>
                                                    <span style={{ color: 'var(--text-muted)' }}>
                                                        ${line.subtotal.toLocaleString('es-AR')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginTop: '12px',
                                        fontSize: '0.8125rem',
                                        color: 'var(--text-muted)'
                                    }}>
                                        <LuCreditCard size={14} />
                                        <span>Pago: {purchase.metodoPago === 'card' ? 'Tarjeta de Crédito' : purchase.metodoPago}</span>
                                        {purchase.cantCuotas > 1 && <span> • {purchase.cantCuotas} cuotas</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px 24px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    backgroundColor: 'rgba(0,0,0,0.1)'
                }}>
                    <button
                        onClick={onClose}
                        className="admin-button secondary"
                        style={{ padding: '10px 24px' }}
                    >
                        Cerrar
                    </button>
                </div>
            </div>

            <style>{`
                .admin-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(0, 255, 136, 0.1);
                    border-radius: 50%;
                    border-top-color: var(--neon-green);
                    animation: spin 1s ease-in-out infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default UserPurchasesModal;
