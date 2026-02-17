import { useEffect } from "react";
import { sileo } from "sileo";

interface Props {
    message: string;
    type?: "success" | "error" | "info" | "warning";
    delay?: number;
}

export default function NotificationHelper({ message, type = "success", delay = 100 }: Props) {
    useEffect(() => {
        const timeout = setTimeout(() => {
            console.log(`[NotificationHelper] Triggering ${type} notification: ${message}`);
            try {
                if (type === "success") sileo.success({ title: message });
                else if (type === "error") sileo.error({ title: message });
                else if (type === "info") sileo.info({ title: message });
                else if (type === "warning") sileo.warning({ title: message });
            } catch (err) {
                console.error("[NotificationHelper] Error triggering notification:", err);
            }
        }, delay);

        return () => clearTimeout(timeout);
    }, [message, type, delay]);

    return null;
}
