import { checkoutStore } from "../store/checkoutStore";

export function initCheckoutFailure() {
    // Log the error for future debugging if it existed in the store
    const { error } = checkoutStore.get();
    if (error) {
        console.error("Failure page reached with store error:", error);
    }
}
