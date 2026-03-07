import { useState, useEffect } from 'react';
import { ManagementService } from '../../services/management\.service';
import type { ManagementPurchase } from '../../types/management\.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LuEye, LuPencil, LuTrash2, LuRefreshCcw, LuCheck, LuClock, LuCircleAlert, LuPlus, LuX } from 'react-icons/lu';
import DataTable, { type Column } from './DataTable';
import SaleDetailModal from './SaleDetailModal';
import styles from './styles/SalesListView.module.css';
import dashboardStyles from './styles/dashboard.module.css';

const SalesListView = () => {
    const [sales, setSales] = useState<ManagementPurchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sort, setSort] = useState('newest');
    const [selectedSale, setSelectedSale] = useState<ManagementPurchase | null>(null);
    const [role, setRole] = useState<'admin' | 'seller' | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('marketflex_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setRole(user.rol);
            } catch (e) {
                console.error("Error parsing role in sales list", e);
            }
        }
    }, []);

    useEffect(() => {
        const fetchSales = async () => {
            if ((window as any).showManagementLoader) (window as any).showManagementLoader();
            try {
                const data = await ManagementService.getAllPurchases();
                setSales(data);
            } catch (err) {
                setError('No se pudieron cargar las ventas.');
                console.error(err);
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('error', 'No se pudieron cargar las ventas del sistema');
                }
            } finally {
                setLoading(false);
                if ((window as any).hideManagementLoader) (window as any).hideManagementLoader();
            }
        };

        fetchSales();
    }, []);

    const filteredSales = sales.filter(sale => {
        if (!sale.usuario) {
            return 'comprador en el local'.includes(searchQuery.toLowerCase()) || searchQuery === '';
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

    const columns: Column<ManagementPurchase>[] = [
        {
            header: 'Fecha y Hora',
            accessor: (sale: ManagementPurchase) => (
                <div className={styles.date}>
                    <span>{format(new Date(sale.fechaHora), 'dd MMM, yyyy', { locale: es })}</span>
                    <span className={styles.time}>{format(new Date(sale.fechaHora), 'HH:mm')} hs</span>
                </div>
            )
        },
        {
            header: 'Comprador',
            accessor: (sale: ManagementPurchase) => (
                <div className={styles.buyer}>
                    {!sale.usuario
                        ? <span style={{ opacity: 0.5, fontStyle: 'italic' }}>{sale.usuarioNombre || 'Comprador en el local'}</span>
                        : <>{sale.usuario?.nombre} {sale.usuario?.apellido}</>}
                </div>
            )
        },
        {
            header: 'Monto',
            accessor: (sale: ManagementPurchase) => (
                <span className={styles.amount}>
                    ${sale.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
            )
        },
        {
            header: 'Estado',
            accessor: (sale: ManagementPurchase) => (
                <span className={`${styles.status} ${getStatusClass(sale.estado)}`}>
                    {getStatusIcon(sale.estado)}
                    {sale.estado}
                </span>
            )
        },
        {
            header: 'Acciones',
            accessor: (sale: ManagementPurchase) => (
                <div className={styles.actions}>
                    {sale.estado.toUpperCase() === 'PENDIENTE' && (
                        <>
                            <button
                                className={`${styles.actionBtn} ${styles.actionComplete}`}
                                title="Completar"
                                onClick={() => handleComplete(sale.id)}
                            >
                                <LuCheck size={18} />
                            </button>
                            <button
                                className={`${styles.actionBtn} ${styles.actionCancel}`}
                                title="Cancelar"
                                onClick={() => handleCancel(sale.id)}
                            >
                                <LuX size={18} />
                            </button>
                        </>
                    )}
                    <button
                        className={styles.actionBtn}
                        title="Ver detalles"
                        onClick={() => setSelectedSale(sale)}
                    >
                        <LuEye size={18} />
                    </button>
                    {role === 'admin' && (
                        <a
                            className={styles.actionBtn}
                            title="Editar"
                            href={`/management/sales/edit?id=${sale.id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <LuPencil size={18} />
                        </a>
                    )}
                    {role === 'admin' && (sale.estado.toUpperCase() === 'CANCELADO' || sale.estado.toUpperCase() === 'COMPLETADO') ? (
                        <button
                            className={`${styles.actionBtn} ${styles.actionDelete}`}
                            title="Borrar"
                            onClick={() => handleDelete(sale.id)}
                        >
                            <LuTrash2 size={18} />
                        </button>
                    ) : null}
                </div>
            )
        }
    ];

    const handleDelete = async (id: string) => {
        if ((window as any).showDeleteSaleModal) {
            (window as any).showDeleteSaleModal(async () => {
                try {
                    if ((window as any).showManagementLoader) (window as any).showManagementLoader();
                    const result = await ManagementService.deletePurchase(id);
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
                    if ((window as any).hideManagementLoader) (window as any).hideManagementLoader();
                }
            });
        }
    };

    const handleComplete = async (id: string) => {
        if ((window as any).showCompleteSaleModal) {
            (window as any).showCompleteSaleModal(async () => {
                try {
                    if ((window as any).showManagementLoader) (window as any).showManagementLoader();
                    const result = await ManagementService.completePurchase(id);
                    if (result.status === 'success') {
                        setSales(prev => prev.map(s => s.id === id ? { ...s, estado: 'COMPLETADO' } : s));
                        if (window.triggerSileo) window.triggerSileo('success', result.message);
                    } else {
                        if (window.triggerSileo) window.triggerSileo('error', result.message);
                    }
                } catch (error) {
                    console.error('Error completing purchase:', error);
                    if (window.triggerSileo) window.triggerSileo('error', 'No se pudo completar la venta');
                } finally {
                    if ((window as any).hideManagementLoader) (window as any).hideManagementLoader();
                }
            });
        }
    };

    const handleCancel = async (id: string) => {
        if ((window as any).showCancelSaleModal) {
            (window as any).showCancelSaleModal(async () => {
                try {
                    if ((window as any).showManagementLoader) (window as any).showManagementLoader();
                    const result = await ManagementService.cancelPurchase(id);
                    if (result.status === 'success') {
                        setSales(prev => prev.map(s => s.id === id ? { ...s, estado: 'CANCELADO' } : s));
                        if (window.triggerSileo) window.triggerSileo('success', result.message);
                    } else {
                        if (window.triggerSileo) window.triggerSileo('error', result.message);
                    }
                } catch (error) {
                    console.error('Error cancelling purchase:', error);
                    if (window.triggerSileo) window.triggerSileo('error', 'No se pudo cancelar la venta');
                } finally {
                    if ((window as any).hideManagementLoader) (window as any).hideManagementLoader();
                }
            });
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
                        {role === 'admin' && (
                            <a href="/management/sales/new" className={dashboardStyles.createButton} style={{ textDecoration: 'none' }}>
                                <LuPlus /> Registrar Venta
                            </a>
                        )}
                    </div>
                    <p>{role === 'seller' ? 'Gestiona y visualiza tus ventas' : 'Gestiona y visualiza todas las transacciones del sistema'}</p>
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
