export type AdminStats = {
    totalRevenue: number;
    totalSales: number;
    averageTicket: number;
    activeUsers: number;
    revenueTrend: number;
    salesTrend: number;
    avgTrend: number;
    userTrend: number;
    conversionRate: number;
    recurrentBuyers: number;
    conversionTrend: number;
    recurrentTrend: number;
    averageItems: number;
    totalDiscount: number;
    cancelRate: number;
    itemsTrend: number;
    discountTrend: number;
    cancelTrend: number;
};

export type AdminPurchase = {
    id: string;
    fechaHora: string;
    total: number;
    metodoPago: string;
    estado: string;
    usuario: {
        nombre: string;
        apellido: string;
    };
    lineas: Array<{
        nombreProducto: string;
        cantidad: number;
        subtotal: number;
    }>;
};
