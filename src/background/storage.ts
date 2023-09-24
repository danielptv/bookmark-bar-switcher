const DEFAULT_CURRENT_TITLE = 'My first bookmark bar 🚀';

export async function getCurrentBarTitle() {
    const { currentBarTitleLocal } = await chrome.storage.local.get('currentBarTitle');
    if (currentBarTitleLocal !== undefined && typeof currentBarTitleLocal === 'string') {
        return currentBarTitleLocal;
    }
    const { currentBarTitle } = await chrome.storage.sync.get('currentBarTitle');
    if (currentBarTitle !== undefined && typeof currentBarTitle === 'string') {
        await chrome.storage.local.set({ currentBarTitle });
        return currentBarTitle;
    }
    await chrome.storage.local.set({ currentBarTitle: DEFAULT_CURRENT_TITLE });
    await chrome.storage.sync.set({ currentBarTitle: DEFAULT_CURRENT_TITLE });
    return DEFAULT_CURRENT_TITLE;
}

export async function updateCurrentBarTitle(currentBarTitle: string) {
    await chrome.storage.local.set({ currentBarTitle });
    await chrome.storage.sync.set({ currentBarTitle });
}
