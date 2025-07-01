/// <reference types="vitest" />
import { mergeConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

import viteConfig from './vite.config';

import type { UserConfig } from 'vite';

export default defineConfig((config) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const baseConfig = viteConfig(config) as UserConfig;

    return mergeConfig(
        baseConfig,
        defineConfig({
            plugins: [tsconfigPaths()],
            test: {
                globals: true,
                environment: 'jsdom',
                setupFiles: 'vitest.setup.ts',
                include: ['src/**/*.test.{ts,tsx}', 'src/**/*.integration.test.tsx'],
                exclude: ['tests/**'],
            },
        })
    );
}); 