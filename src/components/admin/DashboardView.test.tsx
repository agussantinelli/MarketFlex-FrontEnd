import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardView from './DashboardView';
import { AdminService } from '../../services/admin.service';
import type { AdminStats } from '../../types/admin.types';
import '@testing-library/jest-dom';

vi.mock('../../services/admin.service', () => ({
    AdminService: {
        getStats: vi.fn(),
        getAllPurchases: vi.fn()
    }
}));

describe('DashboardView Component', () => {
    const mockStats: AdminStats = {
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
        cancelTrend: -0.2,
        lastRevenue: 1200,
        lastSales: 10,
        lastAverageTicket: 120,
        lastActiveUsers: 30,
        lastConversionRate: 20,
        lastRecurrentBuyers: 10,
        lastAverageItems: 4,
        lastTotalDiscount: 2000,
        lastCancelRate: 1.0,
        latestSales: [
            {
                id: '1',
                usuarioNombre: 'Agus Santinelli',
                total: 150,
                estado: 'COMPLETADO',
                fecha: '2026-02-21T08:20:00Z'
            }
        ],
        highestValueSales: [
            {
                id: '1',
                usuarioNombre: 'Agus Santinelli',
                total: 150,
                estado: 'COMPLETADO',
                fecha: '2026-02-21T08:20:00Z'
            }
        ],
        topProducts: [
            { id: 'p1', nombre: 'Producto Pro', cantidad: 10, ingresos: 500 }
        ],
        mostFrequentBuyers: [
            { id: 'u1', nombre: 'Agus', apellido: 'Santinelli', compras: 5, totalGastado: 750 }
        ],
        topSpendingUsers: [
            { id: 'u1', nombre: 'Agus', apellido: 'Santinelli', compras: 5, totalGastado: 750 }
        ],
        lowStockProducts: [
            { id: 'p2', nombre: 'Poco Stock', cantidad: 2, ingresos: 100 }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });


    it('should render stats cards after loading', async () => {
        (AdminService.getStats as any).mockResolvedValue(mockStats);

        render(<DashboardView />);


        await waitFor(() => {
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
    });

    it('should split date and time into separate columns', async () => {
        (AdminService.getStats as any).mockResolvedValue(mockStats);

        render(<DashboardView />);

        await waitFor(() => {
            // Check headers for "Ventas de Mayor Valor" table which has "Fecha"
            expect(screen.getByText('Fecha')).toBeInTheDocument();

            // Check values (from utils/dateFormatter logic)
            // Splitting '21/02/2026'
            expect(screen.getByText('21/02/2026')).toBeInTheDocument();
        });
    });

    it('should render purchase status with correct class', async () => {
        (AdminService.getStats as any).mockResolvedValue(mockStats);

        render(<DashboardView />);

        await waitFor(() => {
            const statusBadge = screen.getByText('COMPLETADO');
            expect(statusBadge).toBeInTheDocument();
        });
    });
});
