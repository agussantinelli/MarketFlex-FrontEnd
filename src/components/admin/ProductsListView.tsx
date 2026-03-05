import React, { useEffect, useState, useCallback } from 'react';
import DataTable from './DataTable';
import type { Column } from './DataTable';
import { AdminService } from '../../services/admin.service';
import { getFeaturedProducts } from '../../services/product.service';
import type { AdminProduct } from '../../types/admin.types';
import { LuImage, LuStar } from 'react-icons/lu';
import { getImageUrl } from '../../lib/url';
import styles from './styles/SalesListView.module.css';

const ProductsListView: React.FC = () => {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sort, setSort] = useState('relevance');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [featuredCount, setFeaturedCount] = useState(0);
    const limit = 10;

    const fetchFeaturedCount = async () => {
        try {
            const response = await getFeaturedProducts();
            if (response) {
                setFeaturedCount(response.length);
            }
        } catch (error) {
            console.error('Error fetching featured count:', error);
        }
    };

    const fetchProducts = useCallback(async () => {
        if ((window as any).showAdminLoader) (window as any).showAdminLoader();
        setLoading(true);
        try {
            const response = await AdminService.getProducts(page, limit, searchTerm, sort);
            if (response) {
                setProducts(response.data);
                setTotal(response.pagination.total);
            } else {
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('error', 'Error al cargar la lista de productos');
                }
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error de conexión al cargar productos');
            }
        } finally {
            setLoading(false);
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
        }
    }, [page, searchTerm, sort]);

    useEffect(() => {
        fetchProducts();
        fetchFeaturedCount();
    }, [fetchProducts]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const handleToggleFeatured = async (product: AdminProduct) => {
        const newStatus = !product.esDestacado;
        const result = await AdminService.toggleFeature(product.id, newStatus);

        if (result?.status === 'success') {
            // Update local state
            setProducts(prev => prev.map(p =>
                p.id === product.id ? { ...p, esDestacado: newStatus } : p
            ));

            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('success', `Producto ${newStatus ? 'destacado' : 'quitado de destacados'} correctamente.`);
            }
            // Update global count
            setFeaturedCount(prev => newStatus ? prev + 1 : prev - 1);
        } else {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', result?.message || 'Error al actualizar destacados');
            }
        }
    };

    const columns: Column<AdminProduct>[] = [
        {
            header: 'Imagen',
            accessor: (p) => (
                <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.foto ? (
                        <img
                            src={getImageUrl(p.foto)}
                            alt={p.nombre}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <LuImage style={{ opacity: 0.3 }} />
                    )}
                </div>
            ),
            width: '60px'
        },
        {
            header: 'Nombre',
            accessor: (p) => (
                <div>
                    <div style={{ fontWeight: '600', color: 'var(--foreground)' }}>{p.nombre}</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>{p.marca}</div>
                </div>
            )
        },
        { header: 'Categoría', accessor: 'categoria' },
        {
            header: 'Precio',
            accessor: (p) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{formatCurrency(p.precioActual)}</div>
                    {p.precioConDescuento && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--neon-green)' }}>
                            {formatCurrency(p.precioConDescuento)} (Oferta)
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Stock',
            accessor: (p) => (
                <span style={{
                    color: p.stock <= 5 ? '#f87171' : 'inherit',
                    fontWeight: p.stock <= 5 ? 'bold' : 'normal'
                }}>
                    {p.stock} un.
                </span>
            )
        },
        {
            header: 'Destacado',
            align: 'center',
            accessor: (p) => {
                const isLimitReached = featuredCount >= 4;
                const canToggle = p.esDestacado || !isLimitReached;

                return (
                    <button
                        onClick={() => canToggle && handleToggleFeatured(p)}
                        disabled={!canToggle}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: canToggle ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px',
                            margin: '0 auto',
                            transition: 'transform 0.2s ease',
                            color: p.esDestacado ? 'var(--neon-blue)' : (canToggle ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'),
                            opacity: canToggle ? 1 : 0.5
                        }}
                        onMouseEnter={(e) => canToggle && (e.currentTarget.style.transform = 'scale(1.2)')}
                        onMouseLeave={(e) => canToggle && (e.currentTarget.style.transform = 'scale(1)')}
                        title={p.esDestacado ? "Quitar de destacados" : (isLimitReached ? "Límite de 4 alcanzado" : "Marcar como destacado")}
                    >
                        <LuStar
                            fill={p.esDestacado ? 'var(--neon-blue)' : 'transparent'}
                            style={{
                                fontSize: '1.2rem',
                                filter: p.esDestacado ? 'drop-shadow(0 0 5px var(--neon-blue))' : 'none'
                            }}
                        />
                    </button>
                );
            },
            width: '100px'
        }
    ];

    const handleView = (product: AdminProduct) => {
        window.location.href = '/admin/products/' + product.id;
    };

    const handleEdit = (product: AdminProduct) => {
        console.log('Edit product:', product);
        // TODO: Open edit modal
    };

    const handleDelete = async (product: AdminProduct) => {
        if ((window as any).showDeleteProductModal) {
            (window as any).showDeleteProductModal(async () => {
                try {
                    if ((window as any).showAdminLoader) (window as any).showAdminLoader();
                    const { deleteProduct } = await import('../../services/product.service');
                    await deleteProduct(product.id);
                    setProducts(prev => prev.filter(p => p.id !== product.id));
                    setTotal(prev => prev - 1);
                    if (window.triggerSileo) window.triggerSileo('success', 'Producto borrado correctamente');
                } catch (error) {
                    console.error('Error deleting product:', error);
                    if (window.triggerSileo) window.triggerSileo('error', 'No se pudo borrar el producto');
                } finally {
                    if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
                }
            });
        }
    };

    const handleAdd = () => {
        window.location.href = '/admin/products/new';
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Gestión de Productos</h1>
                    <p>Administra el catálogo completo, stock y destacados</p>
                </div>
            </header>

            <DataTable
                title=""
                data={products}
                columns={columns}
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
                searchTerm={searchTerm}
                onSearch={(term) => {
                    setSearchTerm(term);
                    setPage(1);
                }}
                pagination={{
                    total,
                    page,
                    limit,
                    onPageChange: setPage
                }}
                searchPlaceholder="Buscar por nombre o tag..."
                customFilters={
                    <select
                        className={styles.sortSelect}
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="relevance">Por Relevancia</option>
                        <option value="bestselling">Más Vendidos</option>
                        <option value="stock_desc">Más Stock</option>
                        <option value="stock_asc">Menos Stock</option>
                        <option value="price_asc">Menor Precio</option>
                        <option value="price_desc">Mayor Precio</option>
                    </select>
                }
            />
        </div>
    );
};

export default ProductsListView;
