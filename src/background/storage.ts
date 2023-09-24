const DEFAULT_CURRENT_TITLE = 'My first bookmark bar 🚀';

export async function getCurrentBarTitle() {
    const { currentBarTitle } = await chrome.storage.sync.get('currentBarTitle');
    if (currentBarTitle !== undefined && typeof currentBarTitle === 'string') {
        return currentBarTitle;
    }
    await chrome.storage.sync.set({ currentBarTitle: DEFAULT_CURRENT_TITLE });
    return DEFAULT_CURRENT_TITLE;
}
