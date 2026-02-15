import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
    integrations: [icon()],
    server: {
        port: 2611,
    },
});
