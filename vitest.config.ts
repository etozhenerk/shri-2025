/// <reference types="vitest" />
import { mergeConfig } from 'vite';
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
            test: {
                globals: true,
                environment: 'jsdom',
                setupFiles: 'tests/setup.ts',
                include: ['src/**/*.test.{ts,tsx}', 'src/**/*.integration.test.tsx'],
                exclude: ['tests/**'],
            },
        })
    );
}); 