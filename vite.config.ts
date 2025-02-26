import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vitest/config';
import { getManifest } from './src/manifest.ts';
import vue from '@vitejs/plugin-vue';
import webExtension from 'vite-plugin-web-extension';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        webExtension({ manifest: getManifest }),
        // eslint-disable-next-line deprecation/deprecation
        Components({ resolvers: [BootstrapVueNextResolver()], dts: false }),
    ],
    build: { target: 'ESNext' },
    // eslint-disable-next-line unicorn/relative-url-style
    resolve: { alias: { '~': new URL('./src', import.meta.url).pathname } },
});
