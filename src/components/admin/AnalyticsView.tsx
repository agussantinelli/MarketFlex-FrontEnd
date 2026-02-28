import React, { useEffect, useState } from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip as ChartJSTooltip,
    Legend,
    Colors
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import Chart from 'react-apexcharts';
import styles from './styles/dashboard.module.css';
import LoadingSpinner from '../common/LoadingSpinner';
import { AdminService } from '../../services/admin.service';
import type { AnalyticsData } from '../../types/admin.types';

// Register ChartJS components
ChartJS.register(ArcElement, ChartJSTooltip, Legend, Colors);

const AnalyticsView: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const result = await AdminService.getAnalytics();
                if (result) {
                    setData(result);
                }
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(value);
    };

    if (loading) {
        return <LoadingSpinner message="Cargando analíticas..." />;
    }

    if (!data) {
        return <div className={styles.errorContainer}>Error al cargar las analíticas.</div>;
    }

    const { monthlySales, categoryDistribution, brandPerformance, paymentMethodDistribution, salesHeatmap } = data;

    const pieData = {
        labels: categoryDistribution.map(c => c.name),
        datasets: [
            {
                data: categoryDistribution.map(c => c.revenue),
                backgroundColor: [
                    'rgba(65, 163, 255, 0.8)',
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(20, 184, 166, 0.8)',
                ],
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
            },
        ],
    };

    const pieOptions = {
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    color: '#94a3b8',
                    font: {
                        size: 12
                    },
                    padding: 20
                }
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                    }
                }
            }
        },
        maintainAspectRatio: false
    };

    const apexOptions: any = {
        chart: {
            toolbar: { show: false },
            fontFamily: 'inherit',
            background: 'transparent'
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
                distributed: true,
                barHeight: '60%',
                dataLabels: {
                    position: 'top'
                }
            }
        },
        colors: ['#41a3ff', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'],
        dataLabels: {
            enabled: true,
            formatter: function (val: number) {
                return `$${val.toLocaleString()}`;
            },
            offsetX: -6,
            style: {
                fontSize: '12px',
                colors: ['#fff']
            }
        },
        stroke: {
            show: true,
            width: 1,
            colors: ['transparent']
        },
        xaxis: {
            categories: brandPerformance.map(b => b.name),
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#94a3b8',
                    fontSize: '12px'
                }
            }
        },
        grid: { show: false },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (val: number) {
                    return formatCurrency(val);
                }
            }
        },
        legend: { show: false }
    };

    const heatmapOptions: any = {
        chart: {
            type: 'heatmap',
            toolbar: { show: false },
            fontFamily: 'inherit',
            background: 'transparent'
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            width: 1,
            colors: ['#0f172a']
        },
        plotOptions: {
            heatmap: {
                radius: 2,
                enableShades: false,
                colorScale: {
                    ranges: [{
                        from: -1,
                        to: 0,
                        color: '#1e293b',
                        name: '0 ventas',
                    },
                    {
                        from: 1,
                        to: 5,
                        color: '#075985',
                        name: 'Bajo',
                    },
                    {
                        from: 6,
                        to: 15,
                        color: '#0369a1',
                        name: 'Medio',
                    },
                    {
                        from: 16,
                        to: 1000,
                        color: '#0ea5e9',
                        name: 'Alto',
                    }]
                }
            }
        },
        xaxis: {
            type: 'category',
            labels: {
                style: {
                    colors: '#94a3b8',
                    fontSize: '10px'
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#94a3b8',
                    fontSize: '12px'
                }
            }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (val: number) {
                    return `${val} ventas`;
                }
            }
        },
        grid: {
            show: false
        },
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'center',
            labels: {
                colors: '#cbd5e1',
                useSeriesColors: false
            },
            markers: {
                width: 12,
                height: 12,
                radius: 2,
                offsetY: 1
            },
            itemMargin: {
                horizontal: 15,
                vertical: 5
            }
        }
    };

    const apexSeries = [
        {
            name: 'Ingresos',
            data: brandPerformance.map(b => b.revenue)
        }
    ];

    const paymentPieData = {
        labels: paymentMethodDistribution.map(p => {
            const names: any = { card: 'Tarjeta', cash: 'Efectivo', transfer: 'Transferencia' };
            return names[p.name] || p.name;
        }),
        datasets: [
            {
                data: paymentMethodDistribution.map(p => p.revenue),
                backgroundColor: [
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(20, 184, 166, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                ],
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className={styles.analyticsContainer}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Analíticas Avanzadas</h1>
                    <p>Reportes detallados y tendencias de rendimiento del sistema</p>
                </div>
            </header>

            <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                    <h2>Evolución Mensual de Ventas</h2>
                    <p>Ingresos liquidados de los últimos 12 meses</p>
                </div>
                <div style={{ width: '100%', height: 400, marginTop: '2rem' }}>
                    <ResponsiveContainer>
                        <AreaChart data={monthlySales}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#41a3ffff" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0004ffff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                            <XAxis
                                dataKey="month"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(str) => {
                                    if (!str) return '';
                                    const [year, month] = str.split('-');
                                    const date = new Date(parseInt(year), parseInt(month) - 1);
                                    return date.toLocaleDateString('es-ES', { month: 'short' });
                                }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `$${val}`}
                            />
                            <RechartsTooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(4px)'
                                }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Ingresos']}
                                labelFormatter={(label) => `Mes: ${label}`}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#006effff"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={styles.chartsGrid} style={{ marginTop: '2rem' }}>
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h2>Distribución por Categorías</h2>
                        <p>Porcentaje de ingresos según categoría de producto</p>
                    </div>
                    <div style={{ width: '100%', height: 400, marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '80%', height: '100%' }}>
                            <Pie data={pieData} options={pieOptions} />
                        </div>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h2>Rendimiento por Marcas</h2>
                        <p>Top 10 marcas con mayores ingresos brutos</p>
                    </div>
                    <div style={{ width: '100%', height: 400, marginTop: '1rem' }}>
                        <Chart
                            options={apexOptions}
                            series={apexSeries}
                            type="bar"
                            height="100%"
                        />
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h2>Métodos de Pago</h2>
                        <p>Distribución de ingresos por medio de pago</p>
                    </div>
                    <div style={{ width: '100%', height: 400, marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '80%', height: '100%' }}>
                            <Pie data={paymentPieData} options={pieOptions} />
                        </div>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h2>Mapa de Calor de Ventas</h2>
                        <p>Frecuencia de ventas por día y hora (Últimos 30 días)</p>
                    </div>
                    <div style={{ width: '100%', height: 400, marginTop: '1rem' }}>
                        <Chart
                            options={heatmapOptions}
                            series={salesHeatmap}
                            type="heatmap"
                            height="100%"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
