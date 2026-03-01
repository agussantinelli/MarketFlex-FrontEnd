import React, { useEffect, useState, useCallback } from 'react';
import type { Promotion } from '../../types/promotion.types';
import { promotionService } from '../../services/promotion.service';
const { getAll: getAllPromotionsAdmin, delete: deletePromotion } = promotionService;
import { LuPlus, LuPencil, LuTrash2, LuClock, LuCalendar, LuTag, LuStar, LuInbox } from 'react-icons/lu';
import styles from './styles/SalesListView.module.css';
import { getImageUrl } from '../../lib/url';

const PromotionsListView: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPromotions = useCallback(async () => {
        setLoading(true);
        if ((window as any).showAdminLoader) (window as any).showAdminLoader();
        try {
            const response = await getAllPromotionsAdmin();
            const data = (response as any).data || (response as any).promotions || [];
            setPromotions(data);
            setLoading(false);
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
        } catch (error) {
            console.error('Error al cargar las promociones:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'No se pudieron cargar las promociones');
            }
            setLoading(false);
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
        }
    }, []);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    const handleCreate = () => {
        if (window.triggerSileo) window.triggerSileo('info', 'Crear promoción (En desarrollo)');
    };

    const handleEdit = (promo: Promotion) => {
        if (window.triggerSileo) window.triggerSileo('info', `Editar ${promo.nombre} (En desarrollo)`);
    };

    const handleDelete = async (promo: Promotion) => {
        if (window.confirm(`¿Seguro que quieres eliminar la promoción "${promo.nombre}"?`)) {
            try {
                await deletePromotion(promo.id);
                setPromotions(prev => prev.filter(p => p.id !== promo.id));
                if (window.triggerSileo) window.triggerSileo('success', 'Promoción eliminada');
            } catch (error) {
                if (window.triggerSileo) window.triggerSileo('error', 'No se pudo eliminar la promoción');
            }
        }
    };

    const getStatusStyle = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'activo': return { color: 'var(--neon-green)', bg: 'rgba(0, 255, 157, 0.1)' };
            case 'pendiente': return { color: 'var(--neon-orange)', bg: 'rgba(255, 165, 0, 0.1)' };
            case 'vencido': return { color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' };
            case 'cancelado': return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };
            default: return { color: '#fff', bg: 'rgba(255, 255, 255, 0.05)' };
        }
    };

    if (loading && promotions.length === 0) {
        return null; // Let global loader handle
    }

    if (promotions.length === 0) {
        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.titleSection}>
                        <h1>Promociones</h1>
                        <p>Gestioná las ofertas y beneficios del marketplace</p>
                    </div>
                    <button className={styles.actionBtn} onClick={handleCreate} title="Nueva Promoción" style={{ padding: '0.75rem 1.5rem', gap: '8px', fontSize: '0.9rem', fontWeight: '700' }}>
                        <LuPlus size={20} /> Nueva Promoción
                    </button>
                </header>
                <div style={{ padding: '5rem', textAlign: 'center', color: '#64748b' }}>
                    <LuInbox size={64} style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
                    <h3 style={{ color: '#cbd5e1', fontSize: '1.5rem' }}>No hay promociones</h3>
                    <p>Comenzá creando una nueva para atraer más clientes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Promociones</h1>
                    <p>Gestioná las ofertas y beneficios del marketplace</p>
                </div>
                <button
                    className={styles.actionBtn}
                    onClick={handleCreate}
                    style={{
                        background: 'var(--primary)',
                        color: 'var(--background)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '12px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(0, 163, 136, 0.3)'
                    }}
                >
                    <LuPlus size={20} /> Crear Nueva
                </button>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                gap: '2rem'
            }}>
                {promotions.map(promo => {
                    const status = getStatusStyle(promo.estado);
                    return (
                        <div key={promo.id} style={{
                            background: 'rgba(15, 23, 42, 0.6)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '20px',
                            padding: '1.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                e.currentTarget.style.borderColor = 'rgba(0, 255, 157, 0.3)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Accent line */}
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: status.color }}></div>

                            {/* Image Section */}
                            {promo.foto && (
                                <div style={{
                                    width: '100%',
                                    height: '160px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    marginBottom: '0.5rem',
                                    border: '1px solid rgba(255, 255, 255, 0.05)'
                                }}>
                                    <img
                                        src={getImageUrl(promo.foto)}
                                        alt={promo.nombre}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            )}

                            {/* Header: Status and Type */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 12px',
                                    borderRadius: '100px',
                                    background: status.bg,
                                    color: status.color,
                                    fontSize: '0.75rem',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    <LuClock size={14} />
                                    {promo.estado}
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <LuTag size={14} />
                                    {promo.tipoPromocion}
                                </div>
                            </div>

                            {/* Body: Name and Description */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#f8fafc', fontWeight: '800', lineHeight: '1.2' }}>
                                        {promo.nombre}
                                    </h3>
                                    {promo.destacado && (
                                        <LuStar size={20} style={{ color: '#fbbf24', fill: '#fbbf24' }} title="Destacado" />
                                    )}
                                </div>
                                <p style={{
                                    color: '#94a3b8',
                                    fontSize: '0.95rem',
                                    margin: '0.75rem 0',
                                    lineHeight: '1.5',
                                    display: '-webkit-box',
                                    WebkitLineClamp: '2',
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {promo.descripcion || 'Sin descripción disponible.'}
                                </p>
                            </div>

                            {/* Dates Section */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                background: 'rgba(255, 255, 255, 0.03)',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Inicia</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.85rem' }}>
                                        <LuCalendar size={14} />
                                        {new Date(promo.fechaInicio).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Finaliza</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.85rem' }}>
                                        <LuCalendar size={14} />
                                        {new Date(promo.fechaFin).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Footer: Details and Actions */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '0.5rem',
                                paddingTop: '1.25rem',
                                borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        padding: '4px 8px',
                                        background: 'rgba(0, 163, 136, 0.1)',
                                        color: 'var(--primary)',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700'
                                    }}>
                                        {promo.alcance}
                                    </div>
                                    {promo.tipoPromocion === 'NxM' && (
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>
                                            {promo.cantCompra} x {promo.cantPaga}
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleEdit(promo)}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#cbd5e1',
                                            padding: '0.6rem',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(0, 163, 136, 0.1)';
                                            e.currentTarget.style.borderColor = 'var(--primary)';
                                            e.currentTarget.style.color = 'var(--primary)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                            e.currentTarget.style.color = '#cbd5e1';
                                        }}
                                        title="Editar"
                                    >
                                        <LuPencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(promo)}
                                        style={{
                                            background: 'rgba(255, 100, 100, 0.05)',
                                            border: '1px solid rgba(255, 100, 100, 0.1)',
                                            color: '#f87171',
                                            padding: '0.6rem',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 100, 100, 0.1)';
                                            e.currentTarget.style.borderColor = '#f87171';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 100, 100, 0.05)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 100, 100, 0.1)';
                                        }}
                                        title="Eliminar"
                                    >
                                        <LuTrash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PromotionsListView;
