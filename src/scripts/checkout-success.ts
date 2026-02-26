import { checkoutStore, resetCheckout } from "../store/checkoutStore";

export function initCheckoutSuccess() {
    // Get total from store
    const { lastOrderTotal } = checkoutStore.get();
    const montoValor = document.getElementById("monto-valor");

    if (montoValor && lastOrderTotal > 0) {
        montoValor.innerText = `$${lastOrderTotal.toLocaleString('es-AR')}`;
    }

    // Reset store when leaving or after show
    // We want to keep it while the user is on this page in case of refresh
    // but clear it when they navigate away
    const handleReset = () => {
        resetCheckout();
    };

    document.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", handleReset);
    });

    // Also clear on beforeunload to be sure
    window.addEventListener("beforeunload", handleReset);
}
