import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import react from '@astrojs/react';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
    integrations: [icon(), react()],
    output: 'server',
    server: {
        port: 2611,
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
    },
    vite: {
        plugins: [mkcert()],
        server: {
            headers: {
                "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            }
        }
    },
});
