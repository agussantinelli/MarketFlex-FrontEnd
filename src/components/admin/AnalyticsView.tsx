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
import { api } from '../../lib/api';
import LoadingSpinner from '../common/LoadingSpinner';

// Register ChartJS components
ChartJS.register(ArcElement, ChartJSTooltip, Legend, Colors);

interface MonthlyData {
    month: string;
    revenue: number;
}

interface CategoryData {
    name: string;
    revenue: number;
    value: number;
}

interface BrandData {
    name: string;
    revenue: number;
    count: number;
}

interface PaymentMethodData {
    name: string;
    revenue: number;
    value: number;
}

const AnalyticsView: React.FC = () => {
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [brandData, setBrandData] = useState<BrandData[]>([]);
    const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('admin/analytics').json() as any;
                if (response.status === 'success') {
                    setMonthlyData(response.data.monthlySales);
                    setCategoryData(response.data.categoryDistribution);
                    setBrandData(response.data.brandPerformance);
                    setPaymentMethodData(response.data.paymentMethodDistribution);
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

    const pieData = {
        labels: categoryData.map(c => c.name),
        datasets: [
            {
                data: categoryData.map(c => c.revenue),
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
            categories: brandData.map(b => b.name),
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

    const paymentPieData = {
        labels: paymentMethodData.map(p => {
            const names: any = { card: 'Tarjeta', cash: 'Efectivo', transfer: 'Transferencia' };
            return names[p.name] || p.name;
        }),
        datasets: [
            {
                data: paymentMethodData.map(p => p.revenue),
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

    const apexSeries = [
        {
            name: 'Ingresos',
            data: brandData.map(b => b.revenue)
        }
    ];

    if (loading) {
        return <LoadingSpinner message="Cargando analíticas..." />;
    }

    return (
        <div className={styles.analyticsContainer}>
            <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                    <h2>Evolución Mensual de Ventas</h2>
                    <p>Ingresos liquidados de los últimos 12 meses</p>
                </div>
                <div style={{ width: '100%', height: 400, marginTop: '2rem' }}>
                    <ResponsiveContainer>
                        <AreaChart data={monthlyData}>
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
            </div>
        </div>
    );
};

export default AnalyticsView;
