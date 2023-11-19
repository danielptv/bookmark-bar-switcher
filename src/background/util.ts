import { type BookmarksBar } from './workspace';

const CUSTOM_DIRECTORY = 'Bookmark Bars';
const CHROME_OTHER_BOOKMARKS_INDEX = 1;
const OPERA_OTHER_BOOKMARKS_INDEX = 7;

/**
 * Find a bookmarks bar by its id and parent id.
 *
 * @param id - The id.
 * @param parentId - The parent id.
 * @returns The bookmarks bar.
 */
export async function findFolderById(id: string, parentId?: string) {
    let result = await chrome.bookmarks.get(id);
    if (parentId) {
        result = result.filter((bookmark) => bookmark.parentId === parentId);
    }
    return result.at(0) === undefined ? undefined : (result[0] as BookmarksBar);
}

/**
 * Move a bookmark from a source folder to a destination folder.
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
 * Get the id of the folder where the custom bookmarks bars are stored.
 *
 * @returns The folder id.
 */
export async function getCustomDirectoryId() {
    const searchIndex = isOperaBrowser() ? OPERA_OTHER_BOOKMARKS_INDEX : CHROME_OTHER_BOOKMARKS_INDEX;
    const bookmarks = await chrome.bookmarks.getTree();
    if (bookmarks[0].children === undefined) {
        return '';
    }
    const children = await chrome.bookmarks.getChildren(bookmarks[0].children[searchIndex].id);
    const id = children.filter((child) => child.title === CUSTOM_DIRECTORY).map((child) => child.id);
    if (id.length > 0) {
        return id[0];
    }

    const created = await chrome.bookmarks.create({
        parentId: bookmarks[0].children[searchIndex].id,
        title: CUSTOM_DIRECTORY,
    });
    return created.id;
}

/**
 * Get the id of the "Bookmarks Bar".
 *
 * @returns The id.
 */
export async function getBookmarksBarId() {
    const bookmarks = await chrome.bookmarks.getTree();
    if (bookmarks[0].children === undefined) {
        return '';
    }
    return bookmarks[0].children[0].id;
}

/**
 * Get all custom bookmarks bars.
 *
 * @returns The custom bookmarks bars.
 */
export async function getCustomBars() {
    const customDirectoryId = await getCustomDirectoryId();
    const bookmarks = await chrome.bookmarks.getChildren(customDirectoryId);
    return bookmarks.filter((bar) => !bar.url) as BookmarksBar[];
}

/**
 * Determine if Opera is used.
 *
 * @returns True if the browser is Opera, else false.
 */
export function isOperaBrowser() {
    return navigator.userAgent.includes(' OPR/');
}
