import React, { useEffect, useState } from 'react';
import { LuX, LuPackage, LuTag, LuBox } from 'react-icons/lu';
import { promotionService } from '../../services/promotion.service';
import { getImageUrl } from '../../lib/url';

interface AffectedProductsModalProps {
    promotionId: string;
    promotionName: string;
    onClose: () => void;
}

interface AffectedProduct {
    id: string;
    nombre: string;
    foto?: string;
    categoria: string;
    marca: string;
}

const AffectedProductsModal: React.FC<AffectedProductsModalProps> = ({ promotionId, promotionName, onClose }) => {
    const [products, setProducts] = useState<AffectedProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await promotionService.getAffectedProducts(promotionId);
                setProducts(response.data || []);
            } catch (error) {
                console.error("Error fetching affected products:", error);
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('error', 'No se pudieron cargar los productos afectados');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [promotionId]);

    return (
        <div style={{
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
            <div style={{
                backgroundColor: 'var(--bg-dark-secondary)',
                width: '95%',
                maxWidth: '600px',
                maxHeight: '85vh',
                borderRadius: '24px',
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
                    background: 'linear-gradient(to right, rgba(0, 163, 136, 0.05), transparent)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(0, 163, 136, 0.1)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'var(--primary)',
                            boxShadow: '0 0 15px rgba(0, 163, 136, 0.1)'
                        }}>
                            <LuPackage size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Productos Afectados</h2>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', opacity: 0.8 }}>
                                Promoción: {promotionName}
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
                    padding: '24px 32px',
                    overflowY: 'auto',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                            Cargando productos...
                        </div>
                    ) : products.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                            <LuBox size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                            <p style={{ margin: 0, fontSize: '1.1rem' }}>No hay productos activos afectados</p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', opacity: 0.7 }}>
                                Esta promoción puede que no tenga productos asociados o los productos estén inactivos.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                Mostrando {products.length} producto{products.length !== 1 ? 's' : ''}
                            </div>
                            {products.map(product => (
                                <div key={product.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.04)',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                                    }}
                                >
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {product.foto ? (
                                            <img src={getImageUrl(product.foto)} alt={product.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <LuPackage size={24} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {product.nombre}
                                        </h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <LuTag size={12} /> {product.categoria}
                                            </span>
                                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' }}></span>
                                            <span>{product.marca}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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

export default AffectedProductsModal;
