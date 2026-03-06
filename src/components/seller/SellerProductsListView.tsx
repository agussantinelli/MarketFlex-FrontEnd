import React from 'react';
import DataTable from '../admin/DataTable';
import styles from '../admin/styles/ProductsListView.module.css';
import { LuPackage, LuPlus } from 'react-icons/lu';

const SellerProductsListView: React.FC = () => {
    const [userRole, setUserRole] = React.useState<string | null>(null);

    React.useEffect(() => {
        const userStr = localStorage.getItem('marketflex_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserRole(user.rol);
        }
    }, []);

    const canDelete = userRole === 'admin';

    const products: any[] = [];

    const columns = [
        { header: 'Producto', accessor: 'nombre' as const },
        { header: 'Marca', accessor: 'marca' as const },
        { header: 'Precio', accessor: (item: any) => `$${item.precio}` },
        { header: 'Stock', accessor: 'stock' as const },
        { header: 'Estado', accessor: 'estado' as const },
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <div className={styles.iconWrapper}>
                        <LuPackage size={24} />
                    </div>
                    <div>
                        <h1>Mis Productos</h1>
                        <p>Gestiona tu inventario y publicaciones</p>
                    </div>
                </div>
                <button className={styles.createBtn}>
                    <LuPlus size={20} />
                    Nuevo Producto
                </button>
            </header>

            <div className={styles.content}>
                {products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <LuPackage size={48} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }} />
                        <h3 style={{ color: 'rgba(255,255,255,0.4)' }}>Aún no tienes productos</h3>
                        <p style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '1.5rem' }}>Comienza a vender agregando tu primer producto al catálogo.</p>
                        <button className={styles.createBtn} style={{ margin: '0 auto' }}>
                            Agregar mi primer producto
                        </button>
                    </div>
                ) : (
                    <DataTable
                        data={products}
                        columns={columns}
                        onEdit={(item) => console.log('Edit', item)}
                        {...(canDelete ? { onDelete: (item: any) => console.log('Delete', item) } : {})}
                    />
                )}
            </div>
        </div>
    );
};

export default SellerProductsListView;
