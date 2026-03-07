import { useEffect, useState } from 'react';
import { ManagementService } from '../../services/management\.service';
import { LuArrowLeft, LuPackage, LuTag, LuStar, LuTruck, LuClock, LuPercent, LuZap, LuPencil } from 'react-icons/lu';
import styles from './styles/ManagementProductDetailView.module.css';

interface Props {
    productId: string;
}

const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);

const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function ManagementProductDetailView({ productId }: Props) {
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        ManagementService.getManagementProduct(productId).then((res: { status: string; data?: any; message?: string }) => {
            if (res.status === 'success' && res.data) {
                setProduct(res.data);
            } else {
                setError(res.message || 'No se pudo cargar el producto.');
            }
            setLoading(false);
        });
    }, [productId]);

    if (loading) return null;

    if (error) {
        return (
            <div className={styles.errorState}>
                <LuPackage size={48} style={{ opacity: 0.3 }} />
                <p>{error}</p>
                <a href="/management/products" className={styles.backLink}>
                    <LuArrowLeft size={16} /> Volver a Productos
                </a>
            </div>
        );
    }

    const p = product;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <a href="/management/products" className={styles.backLink}>
                        <LuArrowLeft size={16} /> Volver a Productos
                    </a>
                    <a
                        href={`/management/products/${productId}/edit`}
                        className={styles.badge}
                        style={{
                            color: 'var(--neon-green)',
                            borderColor: 'var(--neon-green)',
                            background: 'rgba(0,255,136,0.1)',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                        }}
                    >
                        <LuPencil size={12} /> Editar Producto
                    </a>
                </div>
                <div className={styles.statusBadges}>
                    {p.esDestacado && (
                        <span className={styles.badge} style={{ color: 'var(--neon-blue)', borderColor: 'var(--neon-blue)', background: 'rgba(96,165,250,0.1)' }}>
                            <LuStar size={12} /> Destacado
                        </span>
                    )}
                    {p.envioGratis && (
                        <span className={styles.badge} style={{ color: '#34d399', borderColor: '#34d399', background: 'rgba(52,211,153,0.1)' }}>
                            <LuTruck size={12} /> Envío Gratis
                        </span>
                    )}
                    {p.precioConDescuento && (
                        <span className={styles.badge} style={{ color: '#f59e0b', borderColor: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>
                            <LuPercent size={12} /> En Oferta
                        </span>
                    )}
                    {p.estado === 'INACTIVO' && (
                        <span className={styles.badge} style={{ color: '#f87171', borderColor: '#f87171', background: 'rgba(248,113,113,0.1)' }}>
                            Inactivo
                        </span>
                    )}
                    {p.estado === 'BORRADO' && (
                        <span className={styles.badge} style={{ color: '#f87171', borderColor: '#f87171', background: 'rgba(248,113,113,0.1)' }}>
                            Borrado
                        </span>
                    )}
                </div>
            </div>

            {/* Main grid */}
            <div className={styles.grid}>
                {/* Left column: image + pricing */}
                <div className={styles.leftColumn}>
                    <div className={styles.imageCard}>
                        {p.foto ? (
                            <img src={p.foto} alt={p.nombre} className={styles.productImage} />
                        ) : (
                            <div className={styles.imagePlaceholder}>
                                <LuPackage size={64} style={{ opacity: 0.2 }} />
                            </div>
                        )}
                    </div>

                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Precios</h3>
                        <div className={styles.priceRow}>
                            <span className={styles.priceLabel}>Precio actual</span>
                            <span className={styles.priceValue}>{formatCurrency(p.precioActual)}</span>
                        </div>
                        {p.precioConDescuento && (
                            <div className={styles.priceRow}>
                                <span className={styles.priceLabel}>Con descuento</span>
                                <span className={styles.priceValueDiscount}>{formatCurrency(p.precioConDescuento)}</span>
                            </div>
                        )}
                        <div className={styles.divider} />
                        <h4 className={styles.subCardTitle}>Historial de precios</h4>
                        <div className={styles.priceHistory}>
                            {p.historialPrecios?.slice(0, 5).map((hp: any, i: number) => (
                                <div key={i} className={styles.priceHistoryRow}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{formatDate(hp.fecha)}</span>
                                    <span style={{ fontWeight: '600' }}>{formatCurrency(hp.monto)}</span>
                                </div>
                            ))}
                            {(!p.historialPrecios || p.historialPrecios.length === 0) && (
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sin historial</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right column: details */}
                <div className={styles.rightColumn}>
                    <div className={styles.card}>
                        <h1 className={styles.productName}>{p.nombre}</h1>
                        {p.descripcion && <p className={styles.productDescription}>{p.descripcion}</p>}

                        <div className={styles.metaGrid}>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>ID</span>
                                <span className={styles.metaValue} style={{ fontFamily: 'monospace', fontSize: '0.8rem', opacity: 0.7 }}>{p.id}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Marca</span>
                                <span className={styles.metaValue}>{p.marca || '—'}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Categoría</span>
                                <span className={styles.metaValue}>{p.categoria || '—'}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Subcategoría</span>
                                <span className={styles.metaValue}>{p.subcategoria || '—'}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Stock</span>
                                <span className={styles.metaValue} style={{ color: p.stock <= 5 ? '#f87171' : '#34d399', fontWeight: '700' }}>
                                    {p.stock} unidades
                                </span>
                            </div>
                            {p.autor && (
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Autor</span>
                                    <span className={styles.metaValue}>{p.autor}</span>
                                </div>
                            )}
                            {p.fechaLlegada && (
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Fecha de llegada</span>
                                    <span className={styles.metaValue}>{formatDate(p.fechaLlegada)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    {p.tags?.length > 0 && (
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}><LuTag size={16} /> Tags</h3>
                            <div className={styles.tagList}>
                                {p.tags.map((tag: string, i: number) => (
                                    <span key={i} className={styles.tag}>{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Características */}
                    {p.caracteristicas?.length > 0 && (
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}><LuZap size={16} /> Características</h3>
                            <div className={styles.featuresList}>
                                {p.caracteristicas.map((c: any, i: number) => (
                                    <div key={i} className={styles.featureRow}>
                                        <span className={styles.featureKey}>{c.nombre}</span>
                                        <span className={styles.featureValue}>{c.valor}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Promoción activa */}
                    {p.promocionActiva && (
                        <div className={styles.card} style={{ borderColor: 'rgba(52,211,153,0.3)' }}>
                            <h3 className={styles.cardTitle} style={{ color: '#34d399' }}><LuPercent size={16} /> Promoción Activa</h3>
                            <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{p.promocionActiva.nombre}</p>
                            {p.promocionActiva.descripcion && (
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{p.promocionActiva.descripcion}</p>
                            )}
                            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                                {p.promocionActiva.fechaInicio && (
                                    <div>
                                        <span className={styles.metaLabel}>Inicio</span>
                                        <span className={styles.metaValue}>{formatDate(p.promocionActiva.fechaInicio)}</span>
                                    </div>
                                )}
                                {p.promocionActiva.fechaFin && (
                                    <div>
                                        <span className={styles.metaLabel}>Fin</span>
                                        <span className={styles.metaValue}>{formatDate(p.promocionActiva.fechaFin)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}><LuClock size={16} /> Fechas</h3>
                        <div className={styles.metaGrid}>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Creado</span>
                                <span className={styles.metaValue}>{formatDate(p.creadoEn)}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Actualizado</span>
                                <span className={styles.metaValue}>{formatDate(p.actualizadoEn)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
