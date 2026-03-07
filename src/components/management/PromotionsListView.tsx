import React, { useEffect, useState, useCallback } from 'react';
import type { Promotion } from '../../types/promotion.types';
import { promotionService } from '../../services/promotion.service';
import PromotionForm from './PromotionForm';
import { LuPlus, LuPencil, LuTrash2, LuClock, LuCalendar, LuTag, LuStar, LuInbox, LuX } from 'react-icons/lu';
import styles from './styles/SalesListView.module.css';
import { getImageUrl } from '../../lib/url';

const { getAll: getAllPromotionsAdmin, delete: deletePromotion, create: createPromotion, update: updatePromotion, getById: getPromotionById } = promotionService;

const PromotionsListView: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | undefined>(undefined);
    const [formLoading, setFormLoading] = useState(false);

    const fetchPromotions = useCallback(async () => {
        setLoading(true);
        if ((window as any).showManagementLoader) (window as any).showManagementLoader();
        try {
            const response = await getAllPromotionsAdmin();
            const data = (response as any).data || (response as any).promotions || [];

            // Sort: Featured promotions first
            const sortedData = [...data].sort((a, b) => {
                if (a.esDestacado && !b.esDestacado) return -1;
                if (!a.esDestacado && b.esDestacado) return 1;
                return 0;
            });

            setPromotions(sortedData);
            setLoading(false);
            if ((window as any).hideManagementLoader) (window as any).hideManagementLoader();
        } catch (error) {
            console.error('Error al cargar las promociones:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'No se pudieron cargar las promociones');
            }
            setLoading(false);
            if ((window as any).hideManagementLoader) (window as any).hideManagementLoader();
        }
    }, []);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    const handleCreate = () => {
        setSelectedPromotion(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = async (promo: Promotion) => {
        setLoading(true);
        if ((window as any).showManagementLoader) (window as any).showManagementLoader();
        try {
            // Fetch fresh data including relations
            const response = await getPromotionById(promo.id);
            setSelectedPromotion(response.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching promotion details:', error);
            if (window.triggerSileo) window.triggerSileo('error', 'No se pudieron cargar los detalles de la promoción');
        } finally {
            setLoading(false);
            if ((window as any).hideManagementLoader) (window as any).hideManagementLoader();
        }
    };

    const handleFormSubmit = async (data: any) => {
        setFormLoading(true);
        try {
            if (selectedPromotion) {
                await updatePromotion(selectedPromotion.id, data);
                if (window.triggerSileo) window.triggerSileo('success', 'Promoción actualizada');
            } else {
                await createPromotion(data);
                if (window.triggerSileo) window.triggerSileo('success', 'Promoción creada');
            }
            setIsModalOpen(false);
            fetchPromotions();
        } catch (error) {
            console.error('Error saving promotion:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (promo: Promotion) => {
        if ((window as any).showDeletePromotionModal) {
            (window as any).showDeletePromotionModal(async () => {
                try {
                    await deletePromotion(promo.id);
                    setPromotions(prev => prev.filter(p => p.id !== promo.id));
                    if (window.triggerSileo) window.triggerSileo('success', 'Promoción eliminada');
                } catch (error) {
                    console.error('Error deleting promotion:', error);
                }
            });
        }
    };

    const getStatusStyle = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'activo': return { color: 'var(--neon-green)', bg: 'rgba(0, 255, 157, 0.1)' };
            case 'pendiente': return { color: 'var(--neon-orange)', bg: 'rgba(255, 165, 0, 0.1)' };
            case 'vencido': return { color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' };
            case 'cancelado': return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };
            case 'borrado': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
            case 'inactivo': return { color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' };
            default: return { color: '#fff', bg: 'rgba(255, 255, 255, 0.05)' };
        }
    };

    const humanizeAlcance = (alcance: string) => {
        switch (alcance?.toUpperCase()) {
            case 'GLOBAL': return 'Global';
            case 'POR_TIPO': return 'Por Categoría';
            case 'POR_PRODUCTO': return 'Por Producto';
            default: return alcance;
        }
    };

    const humanizeTipo = (tipo: string) => {
        switch (tipo) {
            case 'NxM': return 'Por Cantidad';
            case 'DESCUENTO_SEGUNDA_UNIDAD': return 'Descuento 2da Unidad';
            default: return tipo;
        }
    };

    if (loading && promotions.length === 0) {
        return null; // Let global loader handle
    }

    if (promotions.length === 0) {
        return (
            <div className={styles.container}>
                <header className={styles.header} style={{ display: 'block', marginBottom: '3.5rem' }}>
                    <div className={styles.titleSection}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1>Promociones</h1>
                            <button className={styles.actionBtn} onClick={handleCreate} title="Nueva Promoción" style={{ padding: '0.75rem 1.5rem', gap: '8px', fontSize: '0.9rem', fontWeight: '700' }}>
                                <LuPlus size={20} /> Nueva Promoción
                            </button>
                        </div>
                        <p>Gestioná las ofertas y beneficios del marketplace</p>
                    </div>
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
            <header className={styles.header} style={{ display: 'block', marginBottom: '3.5rem' }}>
                <div className={styles.titleSection}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h1>Promociones</h1>
                        <button
                            className={styles.actionBtn}
                            onClick={handleCreate}
                            style={{
                                background: 'var(--primary)',
                                color: 'var(--background)',
                                padding: '0.5rem 1rem',
                                borderRadius: '12px',
                                fontWeight: '800',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 0 20px rgba(0, 163, 136, 0.3)',
                                fontSize: '0.9rem'
                            }}
                        >
                            <LuPlus size={18} /> Crear Nueva
                        </button>
                    </div>
                    <p>Gestioná las ofertas y beneficios del marketplace</p>
                </div>
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
                                    {/* Featured Badge on Image */}
                                    {promo.esDestacado && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            backdropFilter: 'blur(4px)',
                                            padding: '8px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid rgba(251, 191, 36, 0.3)',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                            zIndex: 10
                                        }}>
                                            <LuStar size={18} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                                        </div>
                                    )}
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
                                    {humanizeTipo(promo.tipoPromocion)}
                                    <span style={{ margin: '0 8px', width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)' }}></span>
                                    <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{promo.usoCount || 0} usos</span>
                                </div>
                            </div>

                            {/* Body: Name and Description */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#f8fafc', fontWeight: '800', lineHeight: '1.2' }}>
                                        {promo.nombre}
                                    </h3>
                                    {promo.esDestacado && (
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
                                        padding: '4px 10px',
                                        background: 'rgba(0, 163, 136, 0.15)',
                                        color: 'var(--primary)',
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        fontWeight: '800',
                                        textTransform: 'uppercase',
                                        border: '1px solid rgba(0, 255, 136, 0.2)'
                                    }}>
                                        {humanizeAlcance(promo.alcance)}
                                    </div>
                                    {promo.tipoPromocion === 'NxM' && (
                                        <span style={{
                                            color: '#cbd5e1',
                                            fontSize: '0.9rem',
                                            fontWeight: '700',
                                            padding: '4px 8px',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '6px'
                                        }}>
                                            {promo.cantCompra} x {promo.cantPaga}
                                        </span>
                                    )}
                                    {promo.tipoPromocion === 'DESCUENTO_SEGUNDA_UNIDAD' && (
                                        <span style={{
                                            color: '#cbd5e1',
                                            fontSize: '0.9rem',
                                            fontWeight: '700',
                                            padding: '4px 8px',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '6px'
                                        }}>
                                            {promo.porcentajeDescuentoSegunda}% en la 2da
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

            {/* Modal Overlay */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div style={{
                        background: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '1000px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '2.5rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 255, 136, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>
                                    {selectedPromotion ? 'Editar Promoción' : 'Nueva Promoción'}
                                </h2>
                                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>
                                    Configure los detalles y el alcance de su oferta.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: 'none',
                                    color: '#94a3b8',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <LuX size={24} />
                            </button>
                        </div>

                        <PromotionForm
                            promotion={selectedPromotion}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setIsModalOpen(false)}
                            loading={formLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromotionsListView;
