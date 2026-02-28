import { useState, useEffect } from 'react';
import { AdminService } from '../../services/admin.service';
import type { AdminPurchase } from '../../types/admin.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LuEye, LuPencil, LuTrash2, LuRefreshCcw, LuCheck, LuClock, LuCircleAlert } from 'react-icons/lu';
import DataTable, { type Column } from './DataTable';
import styles from './styles/SalesListView.module.css';

const SalesListView = () => {
    const [sales, setSales] = useState<AdminPurchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        const fetchSales = async () => {
            try {
                const data = await AdminService.getAllPurchases();
                setSales(data);
            } catch (err) {
                setError('No se pudieron cargar las ventas.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, []);

    const filteredSales = sales.filter(sale => {
        const fullName = `${sale.usuario.nombre} ${sale.usuario.apellido}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
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
                    {sale.usuario.nombre} {sale.usuario.apellido}
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
            accessor: () => (
                <div className={styles.actions}>
                    <button className={styles.actionBtn} title="Ver detalles">
                        <LuEye size={18} />
                    </button>
                    <button className={styles.actionBtn} title="Editar">
                        <LuPencil size={18} />
                    </button>
                    <button className={styles.actionBtn} title="Borrar">
                        <LuTrash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    if (error) return (
        <div className={styles.error}>
            <LuCircleAlert size={48} color="#f87171" strokeWidth={1} />
            <p>{error}</p>
        </div>
    );


    if (loading) return (
        <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Cargando listado de ventas...</p>
        </div>
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Listado de Ventas</h1>
                    <p>Gestiona y visualiza todas las transacciones del sistema</p>
                </div>
            </header>

            <DataTable
                data={filteredSales}
                columns={columns}
                loading={loading}
                onSearch={setSearchQuery}
                searchTerm={searchQuery}
                searchPlaceholder="Buscar por comprador..."
            />
        </div>
    );
};

export default SalesListView;
