/**
 * @licence Copyright (C) 2022 - present Daniel Purtov
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public Licence as published by
 * the Free Software Foundation, either version 3 of the Licence, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public Licence for more details.
 * *
 * You should have received a copy of the GNU General Public Licence
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @file This file contains functions for user interactions within the extension window.
 *
 * @author Daniel Purtov
 */

import { findFolder, getBookmarksBarId, getCustomBars, getCustomDirectoryId, moveBookmark } from '~/background/util';
import { getCurrentBarTitle, updateCurrentBarTitle } from '~/background/storage';

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
}

export async function exchange(title: string) {
    const customDirectoryId = await getCustomDirectoryId();
    const bookmarkBarId = await getBookmarksBarId();
    const currentBarTitle = await getCurrentBarTitle();
    const [sourceId] = await findFolder(customDirectoryId, title);
    let [targetId] = await findFolder(customDirectoryId, currentBarTitle);

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

export async function add(title: string) {
    return chrome.bookmarks.create({
        parentId: await getCustomDirectoryId(),
        title,
    });
}

export async function rename(id: string, title: string) {
    const customBarsId = await getCustomDirectoryId();
    const currentBarTitle = await getCurrentBarTitle();
    await chrome.bookmarks.update(id, { title });
    const result = await findFolder(customBarsId, currentBarTitle);
    if (result.length === 0) {
        await chrome.storage.sync.set({ currentBarTitle: title });
    }
}

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
