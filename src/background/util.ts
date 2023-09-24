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
 * @file This section contains utility functions for operations on the
 * chrome.bookmarks API.
 *
 * @author Daniel Purtov
 */

const CUSTOM_DIRECTORY = 'Bookmark Bars';

export async function findFolder(parentId: string, title: string): Promise<string[]> {
    const children = await chrome.bookmarks.getChildren(parentId);
    return children.filter((child) => child.title === title).map((child) => child.id);
}

export async function moveBookmark(sourceId: string, targetId: string) {
    const srcBookmarks = await chrome.bookmarks.getChildren(sourceId);
    for (const item of srcBookmarks) {
        await chrome.bookmarks.move(item.id, { parentId: targetId });
    }
}

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

export async function getCustomDirectoryId() {
    const bookmarks = await chrome.bookmarks.getTree();
    if (bookmarks[0].children === undefined) {
        return '';
    }
    const id = await findFolder(bookmarks[0].children[1].id, CUSTOM_DIRECTORY);
    if (id.length > 0) {
        return id[0];
    }
    const created = await chrome.bookmarks.create({
        parentId: bookmarks[0].children[1].id,
        title: CUSTOM_DIRECTORY,
    });
    return created.id;
}

export async function getCustomBars() {
    const customDirectoryId = await getCustomDirectoryId();
    const bookmarks = await chrome.bookmarks.getChildren(customDirectoryId);
    return bookmarks.filter((bar) => !bar.url);
}
