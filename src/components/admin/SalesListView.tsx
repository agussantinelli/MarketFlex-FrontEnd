import { useState, useEffect } from 'react';
import { AdminService } from '../../services/admin.service';
import type { AdminPurchase } from '../../types/admin.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    CheckCircle2,
    Clock,
    XCircle
} from 'lucide-react';
import styles from './styles/SalesListView.module.css';

const SalesListView = () => {
    const [sales, setSales] = useState<AdminPurchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


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

    const filteredSales = sales;

    const getStatusIcon = (estado: string) => {
        switch (estado.toUpperCase()) {
            case 'COMPLETADO':
                return <CheckCircle2 size={16} />;
            case 'PENDIENTE':
                return <Clock size={16} />;
            case 'CANCELADO':
                return <XCircle size={16} />;
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
            default:
                return '';
        }
    };

    if (loading) return (
        <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Cargando listado de ventas...</p>
        </div>
    );

    if (error) return (
        <div className={styles.error}>
            <XCircle size={48} color="#f87171" strokeWidth={1} />
            <p>{error}</p>
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

            <div className={styles.tableContainer}>
                <div className={styles.tableWrapper}>
                    <table className={styles.salesTable}>
                        <thead>
                            <tr>
                                <th>Fecha y Hora</th>
                                <th>Comprador</th>
                                <th>Monto</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map((sale) => (
                                <tr key={sale.id} className={styles.salesRow}>
                                    <td>
                                        <div className={styles.date}>
                                            <span>{format(new Date(sale.fechaHora), 'dd MMM, yyyy', { locale: es })}</span>
                                            <span className={styles.time}>{format(new Date(sale.fechaHora), 'HH:mm')} hs</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.buyer}>
                                            {sale.usuario.nombre} {sale.usuario.apellido}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.amount}>
                                            ${sale.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.status} ${getStatusClass(sale.estado)}`}>
                                            {getStatusIcon(sale.estado)}
                                            {sale.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={styles.viewBtn} title="Ver detalles (Próximamente)" disabled>
                                            Ver Detalles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredSales.length === 0 && (
                                <tr>
                                    <td colSpan={5} className={styles.empty}>
                                        No se encontraron ventas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesListView;
