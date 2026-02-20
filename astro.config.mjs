import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import react from '@astrojs/react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
    integrations: [icon(), react()],
    output: 'server',
    server: {
        port: 2611,
    },
    vite: {
        plugins: [basicSsl()],
    },
});
