import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        define: {
            'process.env.API_HOST': JSON.stringify(env.API_HOST),
        },
        plugins: [react()],
        resolve: {
            alias: {
                '@shri/ui-kit': path.resolve(__dirname, './packages/ui-kit/src'),
                '@shri/playwright': path.resolve(__dirname, './packages/playwright/src'),
                '@app-types': path.resolve(__dirname, './src/types'),
                '@components': path.resolve(__dirname, './src/components'),
                '@hooks': path.resolve(__dirname, './src/hooks'),
                '@pages': path.resolve(__dirname, './src/pages'),
                '@store': path.resolve(__dirname, './src/store'),
                '@styles': path.resolve(__dirname, './src/styles'),
                '@utils': path.resolve(__dirname, './src/utils'),
                '@tests': path.resolve(__dirname, './tests'),
                '@api': path.resolve(__dirname, './src/api'),
            },
        },
    };
});
