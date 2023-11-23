import { defineConfig } from 'vite';
import { getManifest } from './src/manifest';
import vue from '@vitejs/plugin-vue';
import webExtension from '@samrum/vite-plugin-web-extension';

// https://vitejs.dev/config/
export default defineConfig(() => {
    return {
        plugins: [vue(), webExtension({ manifest: getManifest() })],
        // eslint-disable-next-line unicorn/relative-url-style, @typescript-eslint/naming-convention
        resolve: { alias: { '~': new URL('./src', import.meta.url).pathname } },
    };
});
