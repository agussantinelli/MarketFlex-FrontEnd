import { useEffect } from "react";
import { Toaster, sileo } from "sileo";

interface Props {
    message?: string;
    type?: "success" | "error" | "info" | "warning";
    delay?: number;
}

export default function UnifiedNotificationSystem({ message, type = "success", delay = 100 }: Props) {
    console.log("[UnifiedNotificationSystem] Component Rendering...");

    useEffect(() => {
        console.log("[UnifiedNotificationSystem] Component Mounted");
        if (!message) return;

        const timeout = setTimeout(() => {
            console.log(`[UnifiedNotificationSystem] Triggering ${type} notification: ${message}`);
            try {
                sileo.success({ title: message });
                console.log("[UnifiedNotificationSystem] sileo.success called");
            } catch (err) {
                console.error("[UnifiedNotificationSystem] Error triggering notification:", err);
            }
        }, delay);

        return () => clearTimeout(timeout);
    }, [message, type, delay]);

    return (
        <div style={{ position: 'relative', zIndex: 9999 }}>
            <Toaster />
        </div>
    );
}
