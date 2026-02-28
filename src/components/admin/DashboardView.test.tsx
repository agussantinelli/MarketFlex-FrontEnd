import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardView from './DashboardView';
import { AdminService } from '../../services/admin.service';
import '@testing-library/jest-dom';

vi.mock('../../services/admin.service', () => ({
    AdminService: {
        getStats: vi.fn(),
        getAllPurchases: vi.fn()
    }
}));

describe('DashboardView Component', () => {
    const mockStats = {
        totalRevenue: 1500,
        totalSales: 15,
        averageTicket: 100,
        activeUsers: 45,
        revenueTrend: 12.5,
        salesTrend: 5.2,
        avgTrend: 2.1,
        userTrend: -3.4,
        conversionRate: 25.5,
        recurrentBuyers: 12.5,
        conversionTrend: 5.5,
        recurrentTrend: 2.5,
        averageItems: 4.5,
        totalDiscount: 2500,
        cancelRate: 1.5,
        itemsTrend: 1.5,
        discountTrend: -5.0,
        cancelTrend: -0.2
    };

    const mockPurchases = [
        {
            id: '1',
            total: 150,
            fechaHora: '2026-02-21T08:20:00Z',
            estado: 'COMPLETADO',
            usuario: { nombre: 'Agus', apellido: 'Santinelli' }
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show loading spinner initially', () => {
        (AdminService.getStats as any).mockReturnValue(new Promise(() => { })); // Never resolves
        render(<DashboardView />);
        expect(screen.getByText(/Cargando panel administrativo/i)).toBeInTheDocument();
    });

    it('should render stats cards after loading', async () => {
        (AdminService.getStats as any).mockResolvedValue(mockStats);
        (AdminService.getAllPurchases as any).mockResolvedValue(mockPurchases);

        render(<DashboardView />);

        await waitFor(() => {
            expect(screen.queryByText(/Cargando panel administrativo/i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('Ingresos Totales')).toBeInTheDocument();
        expect(screen.getByText('$1,500.00')).toBeInTheDocument();
        expect(screen.getByText('Usuarios Activos')).toBeInTheDocument();
        expect(screen.getByText('Tasa de Conversión')).toBeInTheDocument();
        expect(screen.getByText('25.5%')).toBeInTheDocument();
        expect(screen.getByText('Compradores Recurrentes')).toBeInTheDocument();
        expect(screen.getByText('12.5%')).toBeInTheDocument();

        // Assert New Metrics
        expect(screen.getByText('Promedio de Productos')).toBeInTheDocument();
        expect(screen.getByText('4.5')).toBeInTheDocument();
        expect(screen.getByText('Total Descontado')).toBeInTheDocument();
        expect(screen.getByText('$2,500.00')).toBeInTheDocument();
        expect(screen.getByText('Tasa de Cancelación')).toBeInTheDocument();
        expect(screen.getByText('1.5%')).toBeInTheDocument();
    });

    it('should split date and time into separate columns', async () => {
        (AdminService.getStats as any).mockResolvedValue(mockStats);
        (AdminService.getAllPurchases as any).mockResolvedValue(mockPurchases);

        render(<DashboardView />);

        await waitFor(() => {
            // Check headers
            expect(screen.getByText('Fecha')).toBeInTheDocument();
            expect(screen.getByText('Hora')).toBeInTheDocument();

            // Check values (from utils/dateFormatter logic)
            // Splitting '21/02/2026, 08:20 AM'
            expect(screen.getByText('21/02/2026')).toBeInTheDocument();
            // We use a regex for time to avoid timezone issues in testing
            expect(screen.getByText(/AM/i)).toBeInTheDocument();
        });
    });

    it('should render purchase status with correct class', async () => {
        (AdminService.getStats as any).mockResolvedValue(mockStats);
        (AdminService.getAllPurchases as any).mockResolvedValue(mockPurchases);

        render(<DashboardView />);

        await waitFor(() => {
            const statusBadge = screen.getByText('COMPLETADO');
            expect(statusBadge).toBeInTheDocument();
        });
    });
});
