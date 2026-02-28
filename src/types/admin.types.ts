export type TopProduct = {
    id: string;
    nombre: string;
    cantidad: number;
    ingresos: number;
};

export type TopUser = {
    id: string;
    nombre: string;
    apellido: string;
    compras: number;
    totalGastado: number;
};

export type TopSale = {
    id: string;
    usuarioNombre: string;
    total: number;
    estado: string;
    fecha: string;
};

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
    lastRevenue?: number;
    lastSales?: number;
    lastAverageTicket?: number;
    lastActiveUsers?: number;
    lastConversionRate?: number;
    lastRecurrentBuyers?: number;
    lastAverageItems?: number;
    lastTotalDiscount?: number;
    lastCancelRate?: number;
    // New statistical lists
    latestSales: TopSale[];
    highestValueSales: TopSale[];
    topProducts: TopProduct[];
    mostFrequentBuyers: TopUser[];
    topSpendingUsers: TopUser[];
    lowStockProducts: TopProduct[];
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

export type AnalyticsData = {
    monthlySales: Array<{
        month: string;
        revenue: number;
    }>;
    categoryDistribution: Array<{
        name: string;
        revenue: number;
        value: number;
    }>;
    brandPerformance: Array<{
        name: string;
        revenue: number;
        count: number;
    }>;
    paymentMethodDistribution: Array<{
        name: string;
        revenue: number;
        value: number;
    }>;
    salesHeatmap: Array<{
        name: string;
        data: Array<{
            x: string;
            y: number;
        }>;
    }>;
};

export interface AdminProduct {
    id: string;
    nombre: string;
    descripcion: string | null;
    foto: string | null;
    esDestacado: boolean;
    categoria: string | null;
    subcategoria: string | null;
    marca: string | null;
    precioActual: number;
    precioConDescuento: number | null;
    stock: number;
    envioGratis: boolean;
    fechaLlegada: string | null;
}

export interface PaginatedResponse<T> {
    status: string;
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
