import { type BookmarksBar } from 'bookmarks';

const CUSTOM_DIRECTORY = 'Bookmark Bars';
const CHROME_OTHER_BOOKMARKS_INDEX = 1;
const OPERA_OTHER_BOOKMARKS_INDEX = 7;

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
    } catch (err) {
        console.error("Couldn't find folder", id, parentId, err);
    }
}

/**
 * Move all bookmarks from a source folder to a destination folder.
 *
 * @param sourceId - The source folder id.
 * @param targetId - The target folder id.
 */
export async function moveBookmark(sourceId: string, targetId: string) {
    const srcBookmarks = await chrome.bookmarks.getChildren(sourceId);
    console.log('Move bookmarks', srcBookmarks);
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
    console.log('getCustomDirectoryId', id, children);

    if (id === undefined) {
        const created = await chrome.bookmarks.create({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            parentId: bookmarks[0].children![searchIndex].id,
            title: CUSTOM_DIRECTORY,
        });
        console.log('created', created);
        return created.id;
    }
    console.log('id', id);
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
    const barId = bookmarks[0].children![0].id;
    console.log('getBookmarksBarId', barId);
    return barId;
}

/**
 * Get all custom bookmarks bars.
 *
 * @returns The bookmarks bars.
 */
export async function getCustomBars() {
    const customDirectoryId = await getCustomDirectoryId();
    const bookmarks = await chrome.bookmarks.getChildren(customDirectoryId);
    const customBars = bookmarks.filter((bar) => !bar.url) as BookmarksBar[];
    console.log('getCustomBars', customBars);
    return customBars;
}

/**
 * Determine if Opera browser is used.
 *
 * @returns True if the browser is Opera, else false.
 */
export function isOperaBrowser() {
    return navigator.userAgent.includes(' OPR/');
}
