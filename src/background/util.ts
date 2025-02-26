import { type BookmarksBar } from 'bookmarks';

const CUSTOM_DIRECTORY = 'Bookmark Bars';
const CHROME_OTHER_BOOKMARKS_INDEX = 1;
const OPERA_OTHER_BOOKMARKS_INDEX = 7;
let MAIN_WINDOW_ID: number | undefined;

/**
 * Find a bookmarks folder by id.
 *
 * @param id - The id.
 * @param parentId - The parent id.
 * @returns The bookmarks folder.
 */
export async function findFolder(id: string, parentId?: string) {
    try {
        const bookmarks = await chrome.bookmarks.get(id);
        return bookmarks
            .filter((bookmark) => !bookmark.url)
            .filter((bookmark) => !parentId || bookmark.parentId === parentId)
            .map((bookmark) => bookmark as BookmarksBar)
            .at(0);
        // return undefined in case no bookmarks were found
    } catch {}
}

/**
 * Move all bookmarks from a source folder to a destination folder.
 *
 * @param sourceId - The source folder id.
 * @param targetId - The target folder id.
 */
export async function moveBookmark(sourceId: string, targetId: string) {
    const srcBookmarks = await chrome.bookmarks.getChildren(sourceId);
    for (const item of srcBookmarks) {
        await chrome.bookmarks.move(item.id, { parentId: targetId });
    }
}

/**
 * Get id of the folder containing custom bookmarks bars.
 *
 * @returns The folder id.
 */
export async function getCustomDirectoryId() {
    const searchIndex = isOperaBrowser() ? OPERA_OTHER_BOOKMARKS_INDEX : CHROME_OTHER_BOOKMARKS_INDEX;
    const bookmarks = await chrome.bookmarks.getTree();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const children = await chrome.bookmarks.getChildren(bookmarks[0].children![searchIndex].id);
    const id = children
        .filter((child) => !child.url)
        .filter((child) => child.title === CUSTOM_DIRECTORY)
        .map((child) => child.id)
        .at(0);

    if (id === undefined) {
        const created = await chrome.bookmarks.create({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            parentId: bookmarks[0].children![searchIndex].id,
            title: CUSTOM_DIRECTORY,
        });
        return created.id;
    }
    return id;
}

/**
 * Get id of the "Bookmarks Bar".
 *
 * @returns The id.
 */
export async function getBookmarksBarId() {
    const bookmarks = await chrome.bookmarks.getTree();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return bookmarks[0].children![0].id;
}

/**
 * Get all custom bookmarks bars.
 *
 * @returns The bookmarks bars.
 */
export async function getCustomBars() {
    const customDirectoryId = await getCustomDirectoryId();
    const bookmarks = await chrome.bookmarks.getChildren(customDirectoryId);
    return bookmarks.filter((bar) => !bar.url) as BookmarksBar[];
}

/**
 * Determine if Opera browser is used.
 *
 * @returns True if the browser is Opera, else false.
 */
export function isOperaBrowser() {
    return navigator.userAgent.includes(' OPR/');
}

export async function checkWindowId(windowId: number): Promise<boolean> {
    if (!windowId) {
        console.error('Window ID is not valid:', windowId);
        return false;
    }
    try {
        // If MAIN_WINDOW_ID is undefined, set it and return true
        if (MAIN_WINDOW_ID === undefined) {
            console.log('Setting MAIN_WINDOW_ID to', windowId);
            setMainWindowId(windowId);
            return true;
        }

        // Attempt to fetch the current window
        const currentWindow = await chrome.windows.get(MAIN_WINDOW_ID);

        // If fetched window doesn't have valid `id`, reset MAIN_WINDOW_ID
        if (!currentWindow.id) {
            console.log('MAIN_WINDOW_ID is not valid. Setting MAIN_WINDOW_ID to', windowId);
            setMainWindowId(windowId);
            return true;
        }

        if (MAIN_WINDOW_ID !== windowId) {
            console.log('Tab is not in mainWindow. Do not chaning Bar.', MAIN_WINDOW_ID, windowId);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Error fetching or checking window:', err);

        // Reset MAIN_WINDOW_ID in error cases
        console.log('Assigning a new MAIN_WINDOW_ID due to error:', windowId);
        setMainWindowId(windowId);
        return true;
    }
}

function setMainWindowId(windowId: number) {
    MAIN_WINDOW_ID = windowId;
}
