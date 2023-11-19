import {
    findFolderById,
    getBookmarksBarId,
    getCustomBars,
    getCustomDirectoryId,
    isOperaBrowser,
    moveBookmark,
} from '~/background/util';
import { getCurrentBar, updateCurrentBar, updateLastWorkspaceId } from '~/background/storage';
import { type BookmarksBar } from './workspace';

/**
 * Setup the current bookmarks bar when the extension is first installed
 * or the currently active bookmarks bar was renamed.
 */
export async function setupCurrentBar() {
    await getCurrentBar();
    if (isOperaBrowser()) {
        await updateLastWorkspaceId();
    }
}

/**
 * Exchange the current bookmark bar with the selected bookmark bar by moving
 * to bookmarks from the current bookmark bar to "Other Bookmarks" and the bookmarks
 * from the selected bookmarks bar to the "Bookmarks Bar".
 *
 * @param futureId - The title of the bar that should become the active bookmarks bar.
 */
export async function exchange(futureId: string, currentId?: string) {
    const bookmarkBarId = await getBookmarksBarId();
    console.log("current");
    console.log(await getCurrentBar());
    const currentBar = await (currentId === undefined ? getCurrentBar() : findFolderById(currentId));
    const futureBar = await findFolderById(futureId);

    if (futureBar === undefined || currentBar === undefined || futureBar.id === currentBar.id) {
        return;
    }

    // move the current bar to target folder
    await moveBookmark(bookmarkBarId, currentBar.id);
    // move the source folder to the main bar
    await moveBookmark(futureBar.id, bookmarkBarId);
    await updateCurrentBar(futureBar);
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
    const currentBar = await getCurrentBar();
    await chrome.bookmarks.removeTree(id);
    return currentBar;
}
