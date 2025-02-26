// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@vitejs/plugin-vue' {
    const vue: () => any;
    export default vue;
}

declare module 'vite-plugin-web-extension' {
    const webExtension: (options: any) => any;
    export default webExtension;
}

declare module 'unplugin-vue-components/vite' {
    const Components: (options?: any) => any;
    export default Components;
}
