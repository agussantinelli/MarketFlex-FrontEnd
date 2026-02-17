import { useEffect } from "react";
import { Toaster, sileo } from "sileo";

interface Props {
    message?: string;
    type?: "success" | "error" | "info" | "warning";
    delay?: number;
    position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
    offset?: number | { top?: number; right?: number; bottom?: number; left?: number };
}

export default function UnifiedNotificationSystem({
    message,
    type = "success",
    delay = 100,
    position = "top-right",
    offset
}: Props) {
    useEffect(() => {
        if (!message) return;

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
    }, [message, type, delay]);

    return (
        <Toaster position={position} offset={offset} />
    );
}
