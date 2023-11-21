import {
    findFolder,
    getBookmarksBarId,
    getCustomBars,
    getCustomDirectoryId,
    isOperaBrowser,
    moveBookmark,
} from '~/background/util';
import { getActiveBar, updateActiveBar, updateLastWorkspaceId } from '~/background/storage';
import { type BookmarksBar } from './types';

/**
 * Setup the current bookmarks bar when the extension is first installed
 * or the currently active bookmarks bar was (re)moved.
 */
export async function setupCurrentBar() {
    await getActiveBar();
    if (isOperaBrowser()) {
        await updateLastWorkspaceId();
    }
}

/**
 * Exchange current bookmark bar with the selected bookmark bar by moving
 * bookmarks from the current bookmark bar to "Other Bookmarks" and the bookmarks
 * from the selected bookmarks bar to the "Bookmarks Bar".
 *
 * @param activatedId - The id of the bar that should become the active bookmarks bar.
 * @param deactivatedId - The id of the bar that should be moved back to its folder. (optional)
 */
export async function exchange(activatedId: string, deactivatedId?: string) {
    const bookmarkBarId = await getBookmarksBarId();
    const deactivatedBar = await (deactivatedId === undefined ? getActiveBar() : findFolder(deactivatedId));
    const activatedBar = await findFolder(activatedId);

    if (activatedBar === undefined || deactivatedBar === undefined || activatedBar.id === deactivatedBar.id) {
        return;
    }

    // move the current bar to target folder
    await moveBookmark(bookmarkBarId, deactivatedBar.id);
    // move the source folder to the main bar
    await moveBookmark(activatedBar.id, bookmarkBarId);
    await updateActiveBar(activatedBar);
}

/**
 * Create a new bookmarks bar.
 *
 * @param title - Title of the new bookmarks bar.
 * @returns The created bookmarks bar.
 */
export async function add(title: string) {
    return chrome.bookmarks.create({
        parentId: await getCustomDirectoryId(),
        title,
    }) as Promise<BookmarksBar>;
}

/**
 * Rename a bookmarks bar.
 *
 * @param id - The bar id.
 * @param title - The current title.
 */
export async function rename(id: string, title: string) {
    await chrome.bookmarks.update(id, { title });
}

/**
 * Reorder bookmarks bars using drag-and-drop.
 *
 * @param arr - An array of bookmark bars.
 * @param reorderResult - The desired result object containing the indexes.
 * @returns - The updated array of bookmark bars.
 */
export async function reorder(
    arr: { id: string; title: string; isActive: boolean; editMode: boolean }[],
    reorderResult: { removedIndex: number | null; addedIndex: number | null },
) {
    const { removedIndex, addedIndex } = reorderResult;
    if (removedIndex === null || addedIndex === null || removedIndex === addedIndex) {
        return arr;
    }

    const customDirectoryId = await getCustomDirectoryId();
    const customBars = await getCustomBars();
    const movedBar = customBars[removedIndex];
    await chrome.bookmarks.move(movedBar.id, {
        // need to increment the index by 1 when moving a bar downwards
        index: addedIndex < removedIndex ? addedIndex : addedIndex + 1,
        parentId: customDirectoryId,
    });
    const [element] = arr.splice(removedIndex, 1);
    arr.splice(addedIndex, 0, element);
    return arr;
}

/**
 * Remove a bookmarks bar.
 *
 * @param id - The bar id.
 * @returns - The title of the current bookmarks bar.
 */
export async function remove(id: string) {
    const currentBar = await getActiveBar();
    await chrome.bookmarks.removeTree(id);
    return currentBar;
}
