import { getPurchaseById } from "../services/purchase.service";
import styles from "../pages/orders/styles/order-detail.module.css";

export async function initOrderDetail() {
    const pathParts = window.location.pathname.split('/');
    const orderId = pathParts[pathParts.length - 1];

    const loading = document.getElementById('detail-loading');
    const content = document.getElementById('detail-content');
    const errorView = document.getElementById('detail-error');

    if (!orderId || !loading || !content || !errorView) return;

    try {
        const response = await getPurchaseById(orderId);

        loading.style.display = 'none';
        if (!response.data) {
            errorView.style.display = 'block';
            return;
        }

        const order = response.data;

        // Populate Header
        const title = document.getElementById('order-id-title');
        if (title) title.textContent = `Orden #${order.id.slice(0, 8).toUpperCase()}`;

        const date = new Date(order.fechaHora);
        const dateFull = document.getElementById('order-date-full');
        if (dateFull) dateFull.textContent = date.toLocaleDateString('es-AR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const totalAmount = document.getElementById('order-total-amount');
        if (totalAmount) totalAmount.textContent = `$${Number(order.total).toLocaleString('es-AR')}`;

        // Populate Shipping
        const s = order.detalleEnvio;
        const shipName = document.getElementById('ship-name');
        if (shipName) shipName.textContent = s.nombreCompleto;

        const shipAddress = document.getElementById('ship-address');
        if (shipAddress) shipAddress.textContent = s.direccion;

        const shipLoc = document.getElementById('ship-location');
        if (shipLoc) shipLoc.textContent = `${s.ciudad}, ${s.provincia} (${s.codigoPostal})`;

        const shipPhone = document.getElementById('ship-phone');
        if (shipPhone) shipPhone.textContent = s.telefono;

        // Populate Payment
        const payMethod = document.getElementById('pay-method');
        if (payMethod) payMethod.textContent = order.metodoPago === 'card' ? 'Tarjeta de Crédito' : order.metodoPago;

        if (order.cantCuotas > 1) {
            const cuotasRow = document.getElementById('cuotas-row');
            const cuotasVal = document.getElementById('pay-cuotas');
            if (cuotasRow) cuotasRow.style.display = 'flex';
            if (cuotasVal) cuotasVal.textContent = `${order.cantCuotas} cuotas`;
        }

        // Populate Items Table
        const tableBody = document.getElementById('order-items-body');
        if (tableBody) {
            tableBody.innerHTML = order.lineas.map(item => `
                <tr>
                    <td>
                        <div class="${styles.productInfoCell}">
                            <span class="${styles.productName}">${item.nombreProducto}</span>
                        </div>
                    </td>
                    <td>${item.cantidad}</td>
                    <td>$${Number(item.precioUnitario).toLocaleString('es-AR')}</td>
                    <td style="font-weight: 700; color: #fff;">
                        $${Number(item.subtotal).toLocaleString('es-AR')}
                    </td>
                </tr>
            `).join('');
        }

        content.style.display = 'block';
    } catch (error) {
        console.error("Error loading order detail:", error);
        loading.style.display = 'none';
        errorView.style.display = 'block';
    }
}
