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
            // @ts-ignore
            if (window.triggerSileo) {
                // @ts-ignore
                window.triggerSileo('error', 'No pudimos encontrar la orden solicitada.');
            }
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

        // Totals Calculation
        const itemBaseSubtotal = order.lineas.reduce((acc, line) => acc + (line.precioUnitario * line.cantidad), 0);
        const subtotalEl = document.getElementById('order-subtotal-amount');
        if (subtotalEl) subtotalEl.textContent = `$${itemBaseSubtotal.toLocaleString('es-AR')}`;

        const promosContainer = document.getElementById('promos-container');
        if (promosContainer) {
            if (order.promociones && order.promociones.length > 0) {
                promosContainer.innerHTML = order.promociones.map(p => `
                    <div class="${styles.promoRow}">
                        <span class="${styles.promoLabel}">
                            <span>🎁 ${p.nombre}</span>
                        </span>
                        <span>-$${Number(p.montoDescuento).toLocaleString('es-AR')}</span>
                    </div>
                `).join('');
            } else {
                promosContainer.innerHTML = '';
            }
        }

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

        // Calculate promo discounts distribution
        const promoDiscounts = new Map();
        if (order.promociones) {
            order.promociones.forEach(p => {
                promoDiscounts.set(p.nombre, {
                    totalDiscount: Number(p.montoDescuento),
                    totalBase: 0,
                    appliedCount: 0,
                    appliedDiscount: 0
                });
            });
        }

        order.lineas.forEach(l => {
            if (l.promoAplicada && promoDiscounts.has(l.promoAplicada)) {
                const info = promoDiscounts.get(l.promoAplicada);
                info.totalBase += (Number(l.precioUnitario) * l.cantidad);
                info.appliedCount++;
            }
        });

        // Populate Items Table
        const tableBody = document.getElementById('order-items-body');
        if (tableBody) {
            tableBody.innerHTML = order.lineas.map(item => {
                const baseSubtotal = Number(item.precioUnitario) * item.cantidad;
                let realSubtotal = Number(item.subtotal);

                // Distribute group discount if applicable
                if (item.promoAplicada && promoDiscounts.has(item.promoAplicada)) {
                    const info = promoDiscounts.get(item.promoAplicada);
                    if (info.totalBase > 0) {
                        let lineDiscount = 0;
                        if (info.appliedCount === 1) {
                            // Last element gets remainder to avoid fractional discrepancy
                            lineDiscount = info.totalDiscount - info.appliedDiscount;
                        } else {
                            lineDiscount = (baseSubtotal / info.totalBase) * info.totalDiscount;
                        }
                        info.appliedDiscount += lineDiscount;
                        info.appliedCount--;

                        realSubtotal -= lineDiscount;
                    }
                }

                const saved = baseSubtotal - realSubtotal;

                return `
                <tr>
                    <td>
                        <div class="${styles.productInfoCell}" style="flex-direction: column; align-items: flex-start;">
                            <span class="${styles.productName}">${item.nombreProducto}</span>
                            ${item.promoAplicada ? `<span class="${styles.itemPromoBadge}">🎁 ${item.promoAplicada}</span>` : ''}
                        </div>
                    </td>
                    <td>${item.cantidad}</td>
                    <td>$${Number(item.precioUnitario).toLocaleString('es-AR')}</td>
                    <td style="font-weight: 700; color: #fff;">
                        ${saved > 0.01 ? `<span style="text-decoration: line-through; color: rgba(255,255,255,0.4); font-size: 0.9rem; margin-right: 0.5rem; font-weight: 500;">$${baseSubtotal.toLocaleString('es-AR')}</span>` : ''}
                        $${realSubtotal.toLocaleString('es-AR')}
                    </td>
                </tr>
                `;
            }).join('');
        }

        content.style.display = 'block';
    } catch (error) {
        console.error("Error loading order detail:", error);
        loading.style.display = 'none';
        errorView.style.display = 'block';

        // @ts-ignore
        if (window.triggerSileo) {
            // @ts-ignore
            window.triggerSileo('error', 'Hubo un error de conexión al cargar la orden.');
        }
    }
}
