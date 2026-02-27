import React, { useEffect, useState } from 'react';
import { LuDollarSign, LuShoppingCart, LuTrendingUp, LuUsers, LuDownload, LuPlus, LuArrowUpRight, LuArrowDownRight } from 'react-icons/lu';
import styles from './styles/dashboard.module.css';
import { AdminService } from '../../services/admin.service';
import type { AdminStats, AdminPurchase } from '../../types/admin.types';

const DashboardView: React.FC = () => {
    const [statsData, setStatsData] = useState<AdminStats | null>(null);
    const [recentPurchases, setRecentPurchases] = useState<AdminPurchase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [stats, purchases] = await Promise.all([
                    AdminService.getStats(),
                    AdminService.getAllPurchases()
                ]);
                setStatsData(stats);
                setRecentPurchases(purchases || []);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const stats = [
        {
            title: "Ingresos Totales",
            value: formatCurrency(statsData?.totalRevenue ?? 0),
            trend: statsData?.revenueTrend !== undefined
                ? `${statsData.revenueTrend > 0 ? "+" : ""}${statsData.revenueTrend}%`
                : "0%",
            trendLabel: "este mes",
            icon: LuDollarSign,
            color: "from-green-500 to-green-300",
            isPositive: (statsData?.revenueTrend ?? 0) >= 0,
        },
        {
            title: "Ventas Totales",
            value: (statsData?.totalSales ?? 0).toLocaleString(),
            trend: statsData?.salesTrend !== undefined
                ? `${statsData.salesTrend > 0 ? "+" : ""}${statsData.salesTrend}%`
                : "0%",
            trendLabel: "este mes",
            icon: LuShoppingCart,
            color: "from-blue-500 to-blue-300",
            isPositive: (statsData?.salesTrend ?? 0) >= 0,
        },
        {
            title: "Venta Promedio",
            value: formatCurrency(statsData?.averageTicket ?? 0),
            trend: statsData?.avgTrend !== undefined
                ? `${statsData.avgTrend > 0 ? "+" : ""}${statsData.avgTrend}%`
                : "0%",
            trendLabel: "este mes",
            icon: LuTrendingUp,
            color: "from-purple-500 to-purple-300",
            isPositive: (statsData?.avgTrend ?? 0) >= 0,
        },
        {
            title: "Usuarios Activos",
            value: (statsData?.activeUsers ?? 0).toLocaleString(),
            trend: statsData?.userTrend !== undefined
                ? `${statsData.userTrend > 0 ? "+" : ""}${statsData.userTrend}%`
                : "0%",
            trendLabel: "este mes",
            icon: LuUsers,
            color: "from-yellow-500 to-yellow-300",
            isPositive: (statsData?.userTrend ?? 0) >= 0,
        },
    ];

    if (loading) {
        return <div className={styles.loadingContainer}>Cargando panel...</div>;
    }

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.dashboardHeader}>
                <div>
                    <h1>Panel Administrativo</h1>
                    <p>Resumen de actividad y métricas clave.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.btnSecondary}>
                        <LuDownload /> Exportar
                    </button>
                    <button className={styles.btnPrimary}>
                        <LuPlus /> Nuevo Producto
                    </button>
                </div>
            </header>

            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={`${styles.statIconWrapper} bg-gradient-to-br ${stat.color}`}>
                            <stat.icon className={styles.statIcon} />
                        </div>
                        <div className={styles.statInfo}>
                            <h3>{stat.title}</h3>
                            <div className={styles.statValue}>{stat.value}</div>
                            <span className={`${styles.statTrend} ${stat.isPositive ? styles.positive : styles.negative}`}>
                                {stat.isPositive ? <LuArrowUpRight /> : <LuArrowDownRight />}
                                {stat.trend}
                                <span className={styles.trendLabel}>{stat.trendLabel}</span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.recentActivity}>
                <div className={styles.sectionHeader}>
                    <h2>Transacciones Recientes</h2>
                    <a href="#" className={styles.viewAll}>Ver todas</a>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID Orden</th>
                                <th>Usuario</th>
                                <th>Fecha</th>
                                <th>Monto</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPurchases.length > 0 ? (
                                recentPurchases.slice(0, 10).map((purchase) => (
                                    <tr key={purchase.id}>
                                        <td className={styles.orderId}>#{purchase.id.substring(0, 8).toUpperCase()}</td>
                                        <td className={styles.userCell}>
                                            <div className={styles.userAvatar}>{purchase.usuario.nombre.charAt(0)}</div>
                                            {purchase.usuario.nombre} {purchase.usuario.apellido}
                                        </td>
                                        <td>{formatDate(purchase.fechaHora)}</td>
                                        <td className={styles.amount}>{formatCurrency(Number(purchase.total))}</td>
                                        <td>
                                            <span className={styles[purchase.estado.toLowerCase()] || ""}>
                                                {purchase.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className={styles.emptyTable}>No hay transacciones recientes.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
