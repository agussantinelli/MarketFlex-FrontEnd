import { useEffect } from "react";
import { Toaster, sileo } from "sileo";

interface Props {
    message?: string;
    type?: "success" | "error" | "info" | "warning";
    delay?: number;
    position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
    offset?: number | { top?: number; right?: number; bottom?: number; left?: number };
    requiredQueryParam?: string; // e.g. "success"
}

export default function Notifications({
    message,
    type = "success",
    delay = 100,
    position = "top-center",
    offset,
    requiredQueryParam
}: Props) {
    // Effect for triggering notification from props (on mount/update)
    useEffect(() => {
        if (!message) return;

        // Client-side check for query parameter
        if (requiredQueryParam) {
            const params = new URLSearchParams(window.location.search);
            if (params.get(requiredQueryParam) !== "true") {
                return;
            }
        }

        const timeout = setTimeout(() => {
            try {
                if (type === "success") sileo.success({ title: message });
                else if (type === "error") sileo.error({ title: message });
                else if (type === "info") sileo.info({ title: message });
                else if (type === "warning") sileo.warning({ title: message });
            } catch (err) {
                console.error("[UnifiedNotificationSystem] Error triggering notification:", err);
            }
        }, delay);

        return () => clearTimeout(timeout);
    }, [message, type, delay, requiredQueryParam]);

    // Expose global function for vanilla JS usage
    useEffect(() => {
        // Inject styles dynamically to ensure visibility
        const style = document.createElement('style');
        style.innerHTML = `
            [data-sileo-viewport] {
                z-index: 99999 !important;
                position: fixed !important;
            }
            [data-sileo-viewport][data-position^="top"] {
                top: 80px !important; 
            }
        `;
        document.head.appendChild(style);

        window.triggerSileo = (type: string, message: string) => {
            try {
                // @ts-ignore
                if (sileo[type]) {
                    // @ts-ignore
                    sileo[type]({ title: message });
                    return true;
                }
                return false;
            } catch (err) {
                console.error("[UnifiedNotificationSystem] Error triggering notification:", err);
                return false;
            }
        };

        return () => {
            // @ts-ignore
            delete window.triggerSileo;
            document.head.removeChild(style);
        };
    }, []);

    return (
        <Toaster position={position} offset={offset} />
    );
}
