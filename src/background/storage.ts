import { findFolder } from '~/background/util';

const DEFAULT_CURRENT_TITLE = 'My first bookmark bar 🚀';

export async function getCurrentBarTitle() {
    const { currentBarTitle } = await chrome.storage.sync.get('currentBarTitle');
    if (currentBarTitle !== undefined && typeof currentBarTitle === 'string') {
        return currentBarTitle;
    }
    await chrome.storage.sync.set({ currentBarTitle: DEFAULT_CURRENT_TITLE });
    return DEFAULT_CURRENT_TITLE;
}

export async function getBookmarkBarId() {
    const { bookmarkBarId } = await chrome.storage.sync.get('bookmarkBarId');
    if (bookmarkBarId !== undefined && typeof bookmarkBarId === 'string') {
        return bookmarkBarId;
    }
    const bookmarks = await chrome.bookmarks.getTree();
    if (bookmarks[0].children === undefined) {
        return '';
    }
    await chrome.storage.sync.set({ bookmarkBarId: bookmarks[0].children[0].id });
    return bookmarks[0].children[0].id;
}
