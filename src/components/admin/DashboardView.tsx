import React, { useEffect, useState } from 'react';
import { LuDollarSign, LuShoppingCart, LuTrendingUp, LuUsers, LuArrowUpRight, LuArrowDownRight, LuTarget, LuRotateCw, LuPackage, LuTags, LuTriangleAlert, LuInfo } from 'react-icons/lu';
import styles from './styles/dashboard.module.css';
import { AdminService } from '../../services/admin.service';
import StatTable from './StatTable';
import type { AdminStats, TopSale, TopProduct, TopUser } from '../../types/admin.types';
import { formatOrderDate } from '../../../utils/dateFormatter';
import LoadingSpinner from '../common/LoadingSpinner';

const DashboardView: React.FC = () => {
    const [statsData, setStatsData] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'month' | 'historical'>('month');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const stats = await AdminService.getStats(period);
                setStatsData(stats);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [period]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };


    const statusMap: Record<string, string> = {
        'COMPLETADO': 'COMPLETADO',
        'COMPLETED': 'COMPLETADO',
        'PENDING': 'PENDIENTE',
        'PENDIENTE': 'PENDIENTE',
        'CANCELLED': 'CANCELADO',
        'CANCELADO': 'CANCELADO'
    };

    const stats = [
        {
            title: "Ingresos Totales",
            value: formatCurrency(statsData?.totalRevenue ?? 0),
            trend: statsData?.revenueTrend !== undefined
                ? `${statsData.revenueTrend > 0 ? "+" : ""}${statsData.revenueTrend}%`
                : "0%",
            lastValueStr: formatCurrency(statsData?.lastRevenue ?? 0),
            icon: LuDollarSign,
            color: "from-green-500 to-green-300",
            isPositive: (statsData?.revenueTrend ?? 0) >= 0,
            showTrend: period === 'month' && (statsData?.lastRevenue ?? 0) > 0,
            description: "Suma total facturada por ventas completadas (sin incluir impuestos o extras si no están en el total)."
        },
        {
            title: "Ventas Totales",
            value: (statsData?.totalSales ?? 0).toLocaleString(),
            trend: statsData?.salesTrend !== undefined
                ? `${statsData.salesTrend > 0 ? "+" : ""}${statsData.salesTrend}%`
                : "0%",
            lastValueStr: (statsData?.lastSales ?? 0).toLocaleString(),
            icon: LuShoppingCart,
            color: "from-blue-500 to-blue-300",
            isPositive: (statsData?.salesTrend ?? 0) >= 0,
            showTrend: period === 'month' && (statsData?.lastSales ?? 0) > 0,
            description: "Número total de órdenes que han llegado al estado final de 'COMPLETADO'."
        },
        {
            title: "Venta Promedio",
            value: formatCurrency(statsData?.averageTicket ?? 0),
            trend: statsData?.avgTrend !== undefined
                ? `${statsData.avgTrend > 0 ? "+" : ""}${statsData.avgTrend}%`
                : "0%",
            lastValueStr: formatCurrency(statsData?.lastAverageTicket ?? 0),
            icon: LuTrendingUp,
            color: "from-purple-500 to-purple-300",
            isPositive: (statsData?.avgTrend ?? 0) >= 0,
            showTrend: period === 'month' && (statsData?.lastAverageTicket ?? 0) > 0,
            description: "Ingreso total dividido por la cantidad de ventas. Indica cuánto gasta el cliente en promedio por pedido."
        },
        {
            title: "Usuarios Activos",
            value: (statsData?.activeUsers ?? 0).toLocaleString(),
            trend: statsData?.userTrend !== undefined
                ? `${statsData.userTrend > 0 ? "+" : ""}${statsData.userTrend}%`
                : "0%",
            lastValueStr: (statsData?.lastActiveUsers ?? 0).toLocaleString(),
            icon: LuUsers,
            color: "from-yellow-500 to-yellow-300",
            isPositive: (statsData?.userTrend ?? 0) >= 0,
            showTrend: period === 'month' && (statsData?.lastActiveUsers ?? 0) > 0,
            description: "Total de usuarios registrados en el sistema hasta la fecha."
        },
        {
            title: "Tasa de Conversión",
            value: `${statsData?.conversionRate ?? 0}%`,
            trend: statsData?.conversionTrend !== undefined
                ? `${statsData.conversionTrend > 0 ? "+" : ""}${statsData.conversionTrend}%`
                : "0%",
            lastValueStr: `${statsData?.lastConversionRate ?? 0}%`,
            icon: LuTarget,
            color: "from-pink-500 to-pink-300",
            isPositive: (statsData?.conversionTrend ?? 0) >= 0,
            showTrend: period === 'month' && (statsData?.lastConversionRate ?? 0) > 0,
            description: "Porcentaje de usuarios registrados que han realizado al menos una compra completada."
        },
        {
            title: "Compradores Recurrentes",
            value: `${statsData?.recurrentBuyers ?? 0}%`,
            trend: statsData?.recurrentTrend !== undefined
                ? `${statsData.recurrentTrend > 0 ? "+" : ""}${statsData.recurrentTrend}%`
                : "0%",
            lastValueStr: `${statsData?.lastRecurrentBuyers ?? 0}%`,
            icon: LuRotateCw,
            color: "from-orange-500 to-orange-300",
            isPositive: (statsData?.recurrentTrend ?? 0) >= 0,
            showTrend: period === 'month' && (statsData?.lastRecurrentBuyers ?? 0) > 0,
            description: "Porcentaje de clientes que compraron este mes y ya eran clientes, o que tienen más de una compra (Histórico)."
        },
        {
            title: "Promedio de Productos",
            value: `${statsData?.averageItems ?? 0}`,
            trend: statsData?.itemsTrend !== undefined
                ? `${statsData.itemsTrend > 0 ? "+" : ""}${statsData.itemsTrend}%`
                : "0%",
            lastValueStr: `${statsData?.lastAverageItems ?? 0}`,
            icon: LuPackage,
            color: "from-cyan-500 to-cyan-300",
            isPositive: (statsData?.itemsTrend ?? 0) >= 0,
            showTrend: period === 'month' && (statsData?.lastAverageItems ?? 0) > 0,
            description: "Cantidad media de unidades de producto por cada orden de compra."
        },
        {
            title: "Total Descontado",
            value: formatCurrency(statsData?.totalDiscount ?? 0),
            trend: statsData?.discountTrend !== undefined
                ? `${statsData.discountTrend > 0 ? "+" : ""}${statsData.discountTrend}%`
                : "0%",
            lastValueStr: formatCurrency(statsData?.lastTotalDiscount ?? 0),
            icon: LuTags,
            color: "from-indigo-500 to-indigo-300",
            isPositive: (statsData?.discountTrend ?? 0) >= 0,
            showTrend: period === 'month' && (statsData?.lastTotalDiscount ?? 0) >= 0,
            description: "Ahorro total aplicado a los clientes mediante promociones NxM y descuentos directos."
        },
        {
            title: "Tasa de Cancelación",
            value: `${statsData?.cancelRate ?? 0}%`,
            trend: statsData?.cancelTrend !== undefined
                ? `${statsData.cancelTrend > 0 ? "+" : ""}${statsData.cancelTrend}%`
                : "0%",
            lastValueStr: `${statsData?.lastCancelRate ?? 0}%`,
            icon: LuTriangleAlert,
            color: "from-red-500 to-red-300",
            isPositive: (statsData?.cancelTrend ?? 0) <= 0,
            showTrend: period === 'month' && (statsData?.lastCancelRate ?? 0) > 0,
            description: "Porcentaje de órdenes canceladas sobre el total de órdenes (Completadas + Canceladas + Pendientes)."
        }
    ];

    if (loading) {
        return <LoadingSpinner message="Cargando panel administrativo..." />;
    }

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.dashboardHeader}>
                <div>
                    <h1>Panel Administrativo</h1>
                    <p>Resumen de actividad y métricas clave.</p>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.periodToggleWrapper}>
                        <button
                            className={`${styles.toggleBtn} ${period === 'month' ? styles.active : ''}`}
                            onClick={() => setPeriod('month')}
                        >
                            Este Mes
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${period === 'historical' ? styles.active : ''}`}
                            onClick={() => setPeriod('historical')}
                        >
                            Histórico
                        </button>
                    </div>
                </div>
            </header>

            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={styles.statCard}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className={`${styles.statIconWrapper} bg-gradient-to-br ${stat.color}`}>
                            <stat.icon className={styles.statIcon} />
                        </div>
                        <button className={styles.infoBtn} title={stat.description}>
                            <LuInfo />
                            <div className={styles.infoTooltip}>
                                {stat.description}
                            </div>
                        </button>
                        <div className={styles.statInfo}>
                            <h3>{stat.title}</h3>
                            <div className={styles.statValue}>{stat.value}</div>
                            {period === 'month' && (
                                <span className={styles.statTrend}>
                                    {stat.showTrend && (
                                        <span className={`${styles.trendArrowValue} ${stat.isPositive ? styles.positive : styles.negative}`}>
                                            {stat.isPositive ? <LuArrowUpRight /> : <LuArrowDownRight />}
                                            {stat.trend}
                                        </span>
                                    )}
                                    <span className={styles.trendLabel}>vs {stat.lastValueStr} el mes pasado</span>
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>


            <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: '2rem' }}>
                {/* 1. Las últimas 5 ventas */}
                <StatTable
                    title="Últimas 5 Ventas"
                    headers={['Usuario', 'Monto', 'Estado']}
                    data={statsData?.latestSales || []}
                    renderRow={(sale: TopSale) => {
                        const normalizedStatus = (statusMap[sale.estado] || sale.estado).toLowerCase();
                        return (
                            <tr key={sale.id}>
                                <td className={styles.userCell}>{sale.usuarioNombre}</td>
                                <td className={styles.amount}>{formatCurrency(sale.total)}</td>
                                <td>
                                    <span className={styles[normalizedStatus] || styles.badge}>
                                        {statusMap[sale.estado] || sale.estado}
                                    </span>
                                </td>
                            </tr>
                        );
                    }}
                />

                {/* 2. Las 5 ventas más caras */}
                <StatTable
                    title="Ventas de Mayor Valor"
                    headers={['Usuario', 'Monto', 'Fecha']}
                    data={statsData?.highestValueSales || []}
                    renderRow={(sale: TopSale) => (
                        <tr key={sale.id}>
                            <td className={styles.userCell}>{sale.usuarioNombre}</td>
                            <td className={styles.amount}>{formatCurrency(sale.total)}</td>
                            <td className={styles.dateCell}>{formatOrderDate(sale.fecha).split(', ')[0]}</td>
                        </tr>
                    )}
                />

                {/* 3. Los 5 productos más vendidos */}
                <StatTable
                    title="Productos Más Vendidos"
                    headers={['Producto', 'Cant.', 'Ingresos']}
                    data={statsData?.topProducts || []}
                    renderRow={(prod: TopProduct) => (
                        <tr key={prod.id}>
                            <td className={styles.userCell}>{prod.nombre}</td>
                            <td className={styles.amount}>{prod.cantidad}</td>
                            <td className={styles.amount}>{formatCurrency(prod.ingresos)}</td>
                        </tr>
                    )}
                />

                {/* 4. Los 5 productos con menos stock */}
                <StatTable
                    title="Productos con Poco Stock"
                    headers={['Producto', 'Stock']}
                    data={statsData?.lowStockProducts || []}
                    renderRow={(prod: TopProduct) => (
                        <tr key={prod.id}>
                            <td className={styles.userCell}>{prod.nombre}</td>
                            <td style={{ color: prod.cantidad <= 5 ? '#ff4d4d' : 'inherit', fontWeight: 'bold' }}>
                                {prod.cantidad} un.
                            </td>
                        </tr>
                    )}
                />

                {/* 5. Los 5 usuarios con más compras */}
                <StatTable
                    title="Usuarios Más Frecuentes"
                    headers={['Usuario', 'Compras', 'Total']}
                    data={statsData?.mostFrequentBuyers || []}
                    renderRow={(user: TopUser) => (
                        <tr key={user.id}>
                            <td className={styles.userCell}>{user.nombre} {user.apellido}</td>
                            <td className={styles.amount}>{user.compras}</td>
                            <td className={styles.amount}>{formatCurrency(user.totalGastado)}</td>
                        </tr>
                    )}
                />

                {/* 6. Los 5 usuarios que más gastaron */}
                <StatTable
                    title="Usuarios de Mayor Gasto"
                    headers={['Usuario', 'Total', 'Compras']}
                    data={statsData?.topSpendingUsers || []}
                    renderRow={(user: TopUser) => (
                        <tr key={user.id}>
                            <td className={styles.userCell}>{user.nombre} {user.apellido}</td>
                            <td className={styles.amount}>{formatCurrency(user.totalGastado)}</td>
                            <td className={styles.amount}>{user.compras}</td>
                        </tr>
                    )}
                />
            </div>
        </div>
    );
};

export default DashboardView;
