import React, { useEffect, useState, useCallback } from 'react';
import DataTable from './DataTable';
import type { Column } from './DataTable';
import { AdminService } from '../../services/admin.service';
import { getFeaturedProducts } from '../../services/product.service';
import type { AdminProduct } from '../../types/admin.types';
import { LuImage, LuStar } from 'react-icons/lu';
import { getImageUrl } from '../../lib/url';

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
        setLoading(true);
        try {
            const response = await AdminService.getProducts(page, limit, searchTerm, sort);
            if (response) {
                setProducts(response.data);
                setTotal(response.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
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

            if (window.triggerSileo) {
                window.triggerSileo('success', `Producto ${newStatus ? 'destacado' : 'quitado de destacados'} correctamente.`);
            }
            // Update global count
            setFeaturedCount(prev => newStatus ? prev + 1 : prev - 1);
        } else {
            if (window.triggerSileo) {
                window.triggerSileo('error', result?.message || 'Error al actualizar destacados');
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
        { header: 'Nombre', accessor: 'nombre' },
        { header: 'Categoría', accessor: 'categoria' },
        { header: 'Marca', accessor: 'marca' },
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

    const handleEdit = (product: AdminProduct) => {
        console.log('Edit product:', product);
        // TODO: Open edit modal
    };

    const handleDelete = (product: AdminProduct) => {
        if (window.confirm(`¿Estás seguro de eliminar "${product.nombre}"?`)) {
            console.log('Delete product:', product.id);
            // TODO: Call delete service
        }
    };

    const handleAdd = () => {
        console.log('Add product');
        // TODO: Open add modal
    };

    return (
        <div style={{ padding: '0 1rem' }}>
            <DataTable
                title="Gestión de Productos"
                data={products}
                columns={columns}
                loading={loading}
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
                        style={{
                            padding: '10px 16px',
                            paddingRight: '40px',
                            width: '210px',
                            background: '#1e293b url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2300ff9d\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 16px center',
                            backgroundSize: '16px',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            color: '#00ff9d',
                            border: '1px solid #00ff9d',
                            borderRadius: '8px',
                            outline: 'none',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            boxShadow: '0 0 10px rgba(0, 255, 157, 0.1)'
                        }}
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
