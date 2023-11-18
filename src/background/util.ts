const CUSTOM_DIRECTORY = 'Bookmark Bars';
const CHROME_OTHER_BOOKMARKS_INDEX = 1;
const OPERA_OTHER_BOOKMARKS_INDEX = 7;

/**
 * Find a bookmarks folder by parent id and title.
 *
 * @param parentId - The parent id.
 * @param title - The title.
 * @returns The bookmarks folder id.
 */
export async function findFolder(parentId: string, title: string): Promise<string[]> {
    const children = await chrome.bookmarks.getChildren(parentId);
    return children.filter((child) => child.title === title).map((child) => child.id);
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
 * Handle duplicate bookmark bar names. Duplicate names are prohibited to keep the extension behavior consistent.
 *
 * @param parentId - The parent id.
 * @param title - The initial bookmarks bar title.
 * @returns The final bookmarks bar title.
 */
export async function handleDuplicateName(parentId: string, title: string) {
    const parent = await chrome.bookmarks.getChildren(parentId);
    const parentFolder = parent.map((child) => child.title);
    const count = parentFolder.filter((childTitle) => childTitle === title);

    if (count.length > 1) {
        let postfix = 1;
        while (parentFolder.includes(`${title}_${postfix.toString()}`)) {
            postfix++;
        }
        return `${title}_${postfix.toString()}`;
    }
    return title;
}

/**
 * Get the name of the folder where the custom bookmarks bars are stored.
 *
 * @returns The folder id.
 */
export async function getCustomDirectoryId() {
    const searchIndex = isOperaBrowser() ? OPERA_OTHER_BOOKMARKS_INDEX : CHROME_OTHER_BOOKMARKS_INDEX;
    const bookmarks = await chrome.bookmarks.getTree();
    if (bookmarks[0].children === undefined) {
        return '';
    }
    const id = await findFolder(bookmarks[0].children[searchIndex].id, CUSTOM_DIRECTORY);
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
    return bookmarks.filter((bar) => !bar.url);
}

/**
 * Determine if Opera is used.
 *
 * @returns True if the browser is Opera, else false.
 */
export function isOperaBrowser() {
    return navigator.userAgent.includes(' OPR/');
}
