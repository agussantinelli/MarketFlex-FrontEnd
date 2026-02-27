import { AdminService } from "../services/AdminService";
import styles from "../pages/admin/styles/dashboard.module.css";

export async function initAdminDashboard() {
    const statsContainer = document.querySelector('[class*="statsGrid"]');
    if (!statsContainer) return;

    // 1. Fetch Stats
    const stats = await AdminService.getStats();
    if (stats) {
        updateStatValue(0, formatCurrency(stats.totalRevenue));
        updateStatValue(1, stats.totalSales.toLocaleString());
        updateStatValue(2, formatCurrency(stats.averageTicket));
        updateStatValue(3, stats.activeUsers.toLocaleString());
    }

    // 2. Fetch Purchases
    const purchases = await AdminService.getAllPurchases();
    const tableBody = document.getElementById('transactions-body');

    if (tableBody && purchases.length > 0) {
        tableBody.innerHTML = purchases.map(purchase => `
            <tr>
                <td class="${styles.orderId}">#${purchase.id.substring(0, 8).toUpperCase()}</td>
                <td class="${styles.userCell}">
                    <div class="${styles.userAvatar}">${purchase.usuario.nombre.charAt(0)}</div>
                    ${purchase.usuario.nombre} ${purchase.usuario.apellido}
                </td>
                <td>${formatDate(purchase.fechaHora)}</td>
                <td class="${styles.amount}">${formatCurrency(purchase.total)}</td>
                <td>
                    <span class="${styles[purchase.estado.toLowerCase()] || ''}">
                        ${purchase.estado}
                    </span>
                </td>
            </tr>
        `).join('');
    }
}

function updateStatValue(index: number, value: string) {
    const el = document.getElementById(`stat-value-${index}`);
    if (el) el.textContent = value;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}
