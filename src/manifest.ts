/* eslint-disable camelcase */
import pkg from '../package.json';

const manifest = {
    action: {
        default_icon: {
            16: 'icons/icon16.png',
            32: 'icons/icon32.png',
            48: 'icons/icon48.png',
            128: 'icons/icon128.png',
        },
        default_popup: 'src/popup/index.html',
        default_title: pkg.displayName,
    },
    background: { service_worker: 'src/background/main.ts' },
    icons: {
        16: 'icons/icon16.png',
        32: 'icons/icon32.png',
        48: 'icons/icon48.png',
        128: 'icons/icon128.png',
    },
    commands: {
        'next-bar': {
            suggested_key: { default: 'Ctrl+Down' },
            description: 'Switch to next bookmark bar.',
        },
        'previous-bar': {
            suggested_key: { default: 'Ctrl+Up' },
            description: 'Switch to previous bookmark bar.',
        },
        'switch-to-1': {
            suggested_key: { default: 'Ctrl+Shift+1' },
            description: 'Switch to 1. bookmark bar.',
        },
        'switch-to-2': {
            suggested_key: { default: 'Ctrl+Shift+2' },
            description: 'Switch to 2. bookmark bar.',
        },
        'switch-to-3': { description: 'Switch to 3. bookmark bar.' },
        'switch-to-4': { description: 'Switch to 4. bookmark bar.' },
        'switch-to-5': { description: 'Switch to 5. bookmark bar.' },
        'switch-to-6': { description: 'Switch to 6. bookmark bar.' },
        'switch-to-7': { description: 'Switch to 7. bookmark bar.' },
        'switch-to-8': { description: 'Switch to 8. bookmark bar.' },
        'switch-to-9': { description: 'Switch to 9. bookmark bar.' },
        'switch-to-10': { description: 'Switch to 10. bookmark bar.' },
    },
};

export function getManifest(): chrome.runtime.ManifestV3 {
    return {
        author: pkg.author,
        description: pkg.description,
        name: pkg.displayName,
        version: pkg.version,
        manifest_version: 3,
        permissions: ['bookmarks', 'storage'],
        ...manifest,
    };
}
/* eslint-enable camelcase */
