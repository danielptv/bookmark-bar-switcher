import { defineConfig } from 'vite';
import { getManifest } from './src/manifest.ts';
import vue from '@vitejs/plugin-vue';
import webExtension from 'vite-plugin-web-extension';

// https://vitejs.dev/config/
export default defineConfig(() => {
    return {
        plugins: [vue(), webExtension({ manifest: getManifest })],
        build: { target: 'ESNext' },
        // eslint-disable-next-line unicorn/relative-url-style
        resolve: { alias: { '~': new URL('./src', import.meta.url).pathname } },
    };
});
