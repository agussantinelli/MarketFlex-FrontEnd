export type AdminStats = {
    totalRevenue: number;
    totalSales: number;
    averageTicket: number;
    activeUsers: number;
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
