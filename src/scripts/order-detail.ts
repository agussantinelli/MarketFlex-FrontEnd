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

        const statusBadge = document.getElementById('order-status-badge');
        if (statusBadge) {
            const reactContainer = document.querySelector('[data-purchase-id]');
            if (reactContainer) {
                reactContainer.setAttribute('data-purchase-date', order.fechaHora);
            }

            statusBadge.textContent = order.estado;
            statusBadge.className = `${styles.statusBadge} ${(styles as any)[order.estado.toLowerCase()]}`;

            // Inject Claim Button or View Claims Button
            const existingClaimBtn = document.getElementById('claim-button-injected');
            if (existingClaimBtn) existingClaimBtn.remove(); // Remove to re-render based on state

            if (order.estado !== 'CANCELADO' && order.estado !== 'BORRADO') {
                const hasClaims = order.reclamos && order.reclamos.length > 0;
                const btn = document.createElement('button');
                btn.id = 'claim-button-injected';
                btn.className = (styles as any).btnClaim || '';

                if (hasClaims) {
                    btn.className = (styles as any).btnViewClaims || '';
                    btn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        Ver reclamos pendientes
                    `;
                    btn.onclick = () => window.dispatchEvent(new CustomEvent('open-view-claims-modal'));
                } else {
                    btn.className = (styles as any).btnClaim || '';
                    btn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Realizar Reclamo
                    `;
                    btn.onclick = () => window.dispatchEvent(new CustomEvent('open-claim-modal'));
                }

                statusBadge.parentNode?.appendChild(btn);

                // Ensure data for React wrappers is set
                const container = document.querySelector('[data-purchase-id]');
                if (container) {
                    container.setAttribute('data-claims', JSON.stringify(order.reclamos || []));
                }
            }
        }

        // Handle Pending Reason Info
        const statusInfoContainer = document.getElementById('status-info-container');
        if (statusInfoContainer) {
            if (order.estado === 'PENDIENTE' && order.razonPendiente) {
                const reasons: Record<string, string> = {
                    'ENVIO_DOMICILIO': 'Pendiente de envío a domicilio por parte del correo.',
                    'RETIRO_LOCAL': 'Pendiente de retiro por el cliente en el local.',
                    'ENVIO_AL_CORREO': 'Pendiente de envío al correo por parte del local.'
                };

                statusInfoContainer.innerHTML = `
                    <div class="${styles.statusInfoCard}">
                        <div class="${styles.statusInfoIcon}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        </div>
                        <div class="${styles.statusInfoContent}">
                            <h4>Información de Seguimiento</h4>
                            <p>${reasons[order.razonPendiente!] || 'Tu pedido está siendo procesado.'}</p>
                        </div>
                    </div>
                `;
                statusInfoContainer.style.display = 'block';
            } else {
                statusInfoContainer.style.display = 'none';
            }
        }

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
