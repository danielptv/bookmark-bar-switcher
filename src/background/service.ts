import { findFolder, getBookmarksBarId, getCustomBars, getCustomDirectoryId, isOperaBrowser, moveBookmark } from '~/background/util';
import { getCurrentBarTitle, updateCurrentBarTitle, updateLastWorkspaceId } from '~/background/storage';

/**
 * Setup the current bookmarks bar when the extension is first installed
 * or the currently active bookmarks bar was renamed.
 */
export async function setupCurrentBar() {
    const currentBarTitle = await getCurrentBarTitle();
    const customDirectoryId = await getCustomDirectoryId();
    const result = await findFolder(customDirectoryId, currentBarTitle);
    const currentBarExists = result.length > 0;
    if (!currentBarExists) {
        await chrome.bookmarks.create({
            parentId: customDirectoryId,
            title: currentBarTitle,
        });
    }
    if (isOperaBrowser()) {
        await updateLastWorkspaceId();
    }
}

/**
 * Exchange the current bookmark bar with the selected bookmark bar by moving
 * to bookmarks from the current bookmark bar to "Other Bookmarks" and the bookmarks
 * from the selected bookmarks bar to the "Bookmarks Bar".
 *
 * @param title - The title of the bar that should become the active bookmarks bar.
 */
export async function exchange(title: string, currentTitle?: string) {
    const customDirectoryId = await getCustomDirectoryId();
    const bookmarkBarId = await getBookmarksBarId();
    const currentBarTitle = currentTitle ?? await getCurrentBarTitle();
    console.log(`currTitle: ${currentBarTitle}`);
    const [sourceId] = await findFolder(customDirectoryId, title);
    let [targetId] = await findFolder(customDirectoryId, currentBarTitle);
    console.log(`sourceId: ${sourceId}`);
    console.log(`tragetId: ${targetId}`);

    if (sourceId === targetId) {
        return;
    }

    if (!targetId) {
        const created = await chrome.bookmarks.create({
            parentId: customDirectoryId,
            title: currentBarTitle,
        });
        targetId = created.id;
    }

    // move the current bar to target folder
    await moveBookmark(bookmarkBarId, targetId);
    // move the source folder to the main bar
    await moveBookmark(sourceId, bookmarkBarId);
    await updateCurrentBarTitle(title);
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
    });
}

/**
 * Rename a bookmarks bar.
 *
 * @param id - The bar id.
 * @param title - The current title.
 */
export async function rename(id: string, title: string) {
    const customBarsId = await getCustomDirectoryId();
    const currentBarTitle = await getCurrentBarTitle();
    await chrome.bookmarks.update(id, { title });
    const result = await findFolder(customBarsId, currentBarTitle);
    if (result.length === 0) {
        await chrome.storage.sync.set({ currentBarTitle: title });
    }
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

    const customBars = await getCustomBars();
    const movedBar = customBars[removedIndex];
    await chrome.bookmarks.move(movedBar.id, {
        // need to increment the index by 1 when moving a bar downwards
        index: addedIndex < removedIndex ? addedIndex : addedIndex + 1,
        parentId: movedBar.parentId,
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
    const customDirectoryId = await getCustomDirectoryId();
    let currentBarTitle = await getCurrentBarTitle();

    const currentBarId = await findFolder(customDirectoryId, currentBarTitle);
    const customBars = await getCustomBars();
    if (customBars.length === 1) {
        return;
    }
    const barsIds = customBars.map((customBar) => customBar.id);
    if (id === currentBarId[0]) {
        const currentIndex = barsIds.indexOf(id);
        const updatedIndex = currentIndex === 0 ? barsIds.length - 1 : currentIndex - 1;
        await exchange(customBars[updatedIndex].title);
        await chrome.storage.sync.set({ currentBarTitle: customBars[updatedIndex].title });
        currentBarTitle = customBars[updatedIndex].title;
    }
    await chrome.bookmarks.removeTree(id);
    return currentBarTitle;
}
