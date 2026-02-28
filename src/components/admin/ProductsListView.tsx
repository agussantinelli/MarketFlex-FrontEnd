import React, { useEffect, useState, useCallback } from 'react';
import DataTable from './DataTable';
import type { Column } from './DataTable';
import { AdminService } from '../../services/admin.service';
import type { AdminProduct } from '../../types/admin.types';
import { LuImage, LuCircleCheck, LuCircleX } from 'react-icons/lu';

const ProductsListView: React.FC = () => {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await AdminService.getProducts(page, limit, searchTerm);
            if (response) {
                setProducts(response.data);
                setTotal(response.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const columns: Column<AdminProduct>[] = [
        {
            header: 'Imagen',
            accessor: (p) => (
                <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.foto ? (
                        <img src={p.foto} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            accessor: (p) => (
                p.esDestacado ? <LuCircleCheck style={{ color: 'var(--neon-green)' }} /> : <LuCircleX style={{ opacity: 0.3 }} />
            ),
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
            />
        </div>
    );
};

export default ProductsListView;
