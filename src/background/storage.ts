import { findFolder } from "~/background/util";

const CUSTOM_BARS_FOLDER = 'Bookmark Bars';
const DEFAULT_CURRENT_TITLE = 'My first bookmark bar 🚀';
export async function getCustomFolderId() {
    const { customBarsId } = await chrome.storage.sync.get(
        'customBarsId',
    );
    const bookmarks = await chrome.bookmarks.getTree();
    if (bookmarks[0].children === undefined) {
        return '';
    }
    const actualId = await findFolder(
        bookmarks[0].children[1].id,
        CUSTOM_BARS_FOLDER,
    );
    if (customBarsId !== undefined && (typeof customBarsId === 'string') && actualId.length > 0 && customBarsId === actualId[0]) {
        return customBarsId;
    }

    const customBar = await chrome.bookmarks.create({
        parentId: bookmarks[0].children[1].id,
        title: CUSTOM_BARS_FOLDER,
    });
    await chrome.storage.sync.set({ customBarsId: customBar.id });
    return customBar.id;
}

export async function getCurrentBarTitle() {
    const { currentBarTitle } = await chrome.storage.sync.get(
        'currentBarTitle',
    );
    if (currentBarTitle !== undefined && (typeof currentBarTitle === 'string')) {
        return currentBarTitle;
    }
    await chrome.storage.sync.set({ currentBarTitle: DEFAULT_CURRENT_TITLE });
    return DEFAULT_CURRENT_TITLE;
}

export async function getBookmarkBarId() {
    const { bookmarkBarId } = await chrome.storage.sync.get(
        'bookmarkBarId',
    );
    if (bookmarkBarId !== undefined && (typeof bookmarkBarId === 'string')) {
        return bookmarkBarId;
    }
    const bookmarks = await chrome.bookmarks.getTree();
    if (bookmarks[0].children === undefined) {
        return '';
    }
    await chrome.storage.sync.set(
        { bookmarkBarId: bookmarks[0].children[0].id },
    );
    return bookmarks[0].children[0].id;
}
