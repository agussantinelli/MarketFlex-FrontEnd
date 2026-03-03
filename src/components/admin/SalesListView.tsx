import { useState, useEffect } from 'react';
import { AdminService } from '../../services/admin.service';
import type { AdminPurchase } from '../../types/admin.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LuEye, LuPencil, LuTrash2, LuRefreshCcw, LuCheck, LuClock, LuCircleAlert, LuPlus } from 'react-icons/lu';
import DataTable, { type Column } from './DataTable';
import SaleDetailModal from './SaleDetailModal';
import styles from './styles/SalesListView.module.css';
import dashboardStyles from './styles/dashboard.module.css';

const SalesListView = () => {
    const [sales, setSales] = useState<AdminPurchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sort, setSort] = useState('newest');
    const [selectedSale, setSelectedSale] = useState<AdminPurchase | null>(null);

    useEffect(() => {
        const fetchSales = async () => {
            if ((window as any).showAdminLoader) (window as any).showAdminLoader();
            try {
                const data = await AdminService.getAllPurchases();
                setSales(data);
            } catch (err) {
                setError('No se pudieron cargar las ventas.');
                console.error(err);
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('error', 'No se pudieron cargar las ventas del sistema');
                }
            } finally {
                setLoading(false);
                if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
            }
        };

        fetchSales();
    }, []);

    const filteredSales = sales.filter(sale => {
        if (sale.ventaEnFisico) {
            return 'consumidor final'.includes(searchQuery.toLowerCase()) || searchQuery === '';
        }
        const fullName = `${sale.usuario?.nombre || ''} ${sale.usuario?.apellido || ''}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    const sortedSales = [...filteredSales].sort((a, b) => {
        switch (sort) {
            case 'oldest': return new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime();
            case 'price_desc': return b.total - a.total;
            case 'price_asc': return a.total - b.total;
            default: return new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime();
        }
    });

    const getStatusIcon = (estado: string) => {
        switch (estado.toUpperCase()) {
            case 'COMPLETADO':
                return <LuCheck size={16} />;
            case 'PENDIENTE':
                return <LuClock size={16} />;
            case 'CANCELADO':
                return <LuCircleAlert size={16} />;
            case 'PROCESANDO':
                return <LuRefreshCcw size={16} className={styles.spin} />;
            default:
                return null;
        }
    };

    const getStatusClass = (estado: string) => {
        switch (estado.toUpperCase()) {
            case 'COMPLETADO':
                return styles.statusCompleted;
            case 'PENDIENTE':
                return styles.statusPending;
            case 'CANCELADO':
                return styles.statusCancelled;
            case 'PROCESANDO':
                return styles.statusProcessing;
            default:
                return '';
        }
    };

    const columns: Column<AdminPurchase>[] = [
        {
            header: 'Fecha y Hora',
            accessor: (sale: AdminPurchase) => (
                <div className={styles.date}>
                    <span>{format(new Date(sale.fechaHora), 'dd MMM, yyyy', { locale: es })}</span>
                    <span className={styles.time}>{format(new Date(sale.fechaHora), 'HH:mm')} hs</span>
                </div>
            )
        },
        {
            header: 'Comprador',
            accessor: (sale: AdminPurchase) => (
                <div className={styles.buyer}>
                    {sale.ventaEnFisico
                        ? <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Consumidor Final</span>
                        : <>{sale.usuario?.nombre} {sale.usuario?.apellido}</>}
                </div>
            )
        },
        {
            header: 'Monto',
            accessor: (sale: AdminPurchase) => (
                <span className={styles.amount}>
                    ${sale.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
            )
        },
        {
            header: 'Estado',
            accessor: (sale: AdminPurchase) => (
                <span className={`${styles.status} ${getStatusClass(sale.estado)}`}>
                    {getStatusIcon(sale.estado)}
                    {sale.estado}
                </span>
            )
        },
        {
            header: 'Acciones',
            accessor: (sale: AdminPurchase) => (
                <div className={styles.actions}>
                    <button
                        className={styles.actionBtn}
                        title="Ver detalles"
                        onClick={() => setSelectedSale(sale)}
                    >
                        <LuEye size={18} />
                    </button>
                    <a
                        className={styles.actionBtn}
                        title="Editar"
                        href={`/admin/sales/edit?id=${sale.id}`}
                        style={{ textDecoration: 'none' }}
                    >
                        <LuPencil size={18} />
                    </a>
                    <button
                        className={styles.actionBtn}
                        title="Borrar"
                        onClick={() => handleDelete(sale.id, `Venta de ${sale.usuario?.nombre || 'Consumidor Final'}`)}
                    >
                        <LuTrash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`¿Seguro que quieres borrar la ${name}? Pasará a estado BORRADO.`)) {
            try {
                if ((window as any).showAdminLoader) (window as any).showAdminLoader();
                const result = await AdminService.deletePurchase(id);
                if (result.status === 'success') {
                    setSales(prev => prev.filter(s => s.id !== id));
                    if (window.triggerSileo) window.triggerSileo('success', 'Venta borrada correctamente');
                } else {
                    if (window.triggerSileo) window.triggerSileo('error', result.message);
                }
            } catch (error) {
                console.error('Error deleting purchase:', error);
                if (window.triggerSileo) window.triggerSileo('error', 'No se pudo borrar la venta');
            } finally {
                if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
            }
        }
    };

    if (error) return (
        <div className={styles.error}>
            <LuCircleAlert size={48} color="#f87171" strokeWidth={1} />
            <p>{error}</p>
        </div>
    );


    // No longer return null, allow the component to render so the DataTable
    // can show its own internal loading state if the global loader is hidden.

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <div className={dashboardStyles.dashboardHeader}>
                        <h1>Listado de Ventas</h1>
                        <a href="/admin/sales/new" className={dashboardStyles.createButton} style={{ textDecoration: 'none' }}>
                            <LuPlus /> Registrar Venta
                        </a>
                    </div>
                    <p>Gestiona y visualiza todas las transacciones del sistema</p>
                </div>
            </header>

            <DataTable
                data={sortedSales}
                columns={columns}
                loading={loading}
                onSearch={setSearchQuery}
                searchTerm={searchQuery}
                searchPlaceholder="Buscar por comprador..."
                customFilters={
                    <select
                        className={styles.sortSelect}
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="newest">Más Recientes</option>
                        <option value="oldest">Más Antiguas</option>
                        <option value="price_desc">Mayor Monto</option>
                        <option value="price_asc">Menor Monto</option>
                    </select>
                }
            />

            {selectedSale && (
                <SaleDetailModal
                    sale={selectedSale}
                    onClose={() => setSelectedSale(null)}
                />
            )}
        </div>
    );
};

export default SalesListView;
