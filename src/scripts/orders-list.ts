import { getMyPurchases } from "../services/purchase.service";
import type { Purchase } from "../types/purchase.types";

export async function initOrdersList() {
    const ordersLoading = document.getElementById('orders-loading');
    const ordersEmpty = document.getElementById('orders-empty');
    const ordersList = document.getElementById('orders-list');

    if (!ordersLoading || !ordersEmpty || !ordersList) return;

    try {
        const response = await getMyPurchases();

        ordersLoading.style.display = 'none';

        if (!response.data || response.data.length === 0) {
            ordersEmpty.style.display = 'block';
            return;
        }

        ordersList.innerHTML = response.data.map((order: Purchase) => {
            const date = new Date(order.fechaHora);
            const formattedDate = date.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            const formattedTime = date.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const itemsCount = order.lineas.reduce((acc, curr) => acc + curr.cantidad, 0);

            return `
                <a href="/orders/${order.id}" class="order-card">
                    <div class="order-icon-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    </div>
                    <div class="order-info">
                        <h3>Orden #${order.id.slice(0, 8).toUpperCase()}</h3>
                        <p class="order-date">${formattedDate} • ${formattedTime}</p>
                    </div>
                    <div class="order-stats">
                        <span class="order-total">$${Number(order.total).toLocaleString('es-AR')}</span>
                        <span class="order-items-count">${itemsCount} ${itemsCount === 1 ? 'artículo' : 'artículos'}</span>
                    </div>
                    <div class="view-detail-btn">
                        Ver Detalle
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                </a>
            `;
        }).join('');
        ordersList.style.display = 'flex';
    } catch (error) {
        console.error("Error loading orders:", error);
        ordersLoading.innerHTML = `
            <p class="empty-text" style="color: #ef4444;">No pudimos cargar tus compras. Por favor, reintenta más tarde.</p>
        `;
    }
}
