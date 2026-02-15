import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

export default defineConfig({
    integrations: [icon()],
    server: {
        port: 2611,
    },
});
