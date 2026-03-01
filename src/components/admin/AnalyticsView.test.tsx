import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AnalyticsView from './AnalyticsView';
import { api } from '../../lib/api';
import '@testing-library/jest-dom';

// Modern mock for the api client
vi.mock('../../lib/api', () => ({
    api: {
        get: vi.fn(() => ({
            json: vi.fn()
        }))
    }
}));

// Mock charting libraries to avoid rendering issues in JSDOM
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
    Area: () => <div>Area</div>,
    XAxis: () => <div>XAxis</div>,
    YAxis: () => <div>YAxis</div>,
    CartesianGrid: () => <div>Grid</div>,
    Tooltip: () => <div>Tooltip</div>
}));

vi.mock('react-chartjs-2', () => ({
    Pie: () => <div data-testid="pie-chart">Pie Chart</div>
}));

vi.mock('react-apexcharts', () => ({
    default: () => <div data-testid="apex-chart">Apex Chart</div>
}));

describe('AnalyticsView Component', () => {
    const mockAnalyticsData = {
        status: 'success',
        data: {
            monthlySales: [
                { month: '2024-01', revenue: 1000 },
                { month: '2024-02', revenue: 2000 }
            ],
            categoryDistribution: [
                { name: 'Electrónica', revenue: 5000, value: 10 },
                { name: 'Hogar', revenue: 3000, value: 5 }
            ],
            brandPerformance: [
                { name: 'Sony', revenue: 4000, count: 8 },
                { name: 'Samsung', revenue: 3500, count: 5 }
            ],
            paymentMethodDistribution: [
                { name: 'card', revenue: 6000, value: 12 },
                { name: 'cash', revenue: 4000, value: 5 }
            ],
            salesHeatmap: [
                { name: 'Lunes', data: [{ x: '00:00', y: 10 }] }
            ]
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });


    it('should render all chart headers and containers after loading', async () => {
        (api.get as any).mockReturnValue({
            json: vi.fn().mockResolvedValue(mockAnalyticsData)
        });

        render(<AnalyticsView />);

        await waitFor(() => {
            expect(screen.queryByText(/Cargando analíticas.../i)).not.toBeInTheDocument();
        });

        // Check headers
        expect(screen.getByText('Evolución Mensual de Ventas')).toBeInTheDocument();
        expect(screen.getByText('Distribución por Categorías')).toBeInTheDocument();
        expect(screen.getByText('Métodos de Pago')).toBeInTheDocument();
        expect(screen.getByText('Rendimiento por Marcas')).toBeInTheDocument();
        expect(screen.getByText('Mapa de Calor de Ventas')).toBeInTheDocument();

        // Check if chart mocks are rendered
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
        const pieCharts = screen.getAllByTestId('pie-chart');
        expect(pieCharts).toHaveLength(2);
        const apexCharts = screen.getAllByTestId('apex-chart');
        expect(apexCharts).toHaveLength(2);
    });

    it('should handle API error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        (api.get as any).mockReturnValue({
            json: vi.fn().mockRejectedValue(new Error('API Error'))
        });

        render(<AnalyticsView />);

        await waitFor(() => {
            expect(screen.queryByText(/Cargando analíticas.../i)).not.toBeInTheDocument();
        });

        expect(consoleSpy).toHaveBeenCalledWith('Error fetching analytics:', expect.any(Error));
        consoleSpy.mockRestore();
    });
});
