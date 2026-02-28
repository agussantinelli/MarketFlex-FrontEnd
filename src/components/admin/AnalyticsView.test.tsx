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
            ]
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show loading state initially', () => {
        (api.get as any).mockReturnValue({
            json: () => new Promise(() => { }) // Never resolves
        });
        render(<AnalyticsView />);
        expect(screen.getByText(/Cargando analíticas.../i)).toBeInTheDocument();
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
        expect(screen.getByText('Rendimiento por Marcas')).toBeInTheDocument();

        // Check if chart mocks are rendered
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
        expect(screen.getByTestId('apex-chart')).toBeInTheDocument();
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
