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
 * @file This file contains functions for handling user interaction with bookmarks outside the extension window.
 *
 * @author Daniel Purtov
 */

import { exchange, init } from '~/background/service';
import { findFolder, handleDuplicateName } from '~/background/util';
import { getCurrentBarTitle, getCustomFolderId } from '~/background/storage';

export const handleUpdate = async (id: string, info: { title: string }) => {
    const customFolderId = await getCustomFolderId();
    const currentBarTitle = await getCurrentBarTitle();
    if (id === customFolderId) {
        await init();
        return;
    }

    chrome.bookmarks.onChanged.removeListener(handleUpdate);
    const title = await handleDuplicateName(customFolderId, info.title);
    await chrome.bookmarks.update(id, { title });
    chrome.bookmarks.onChanged.addListener(handleUpdate);

    const result = await findFolder(customFolderId, currentBarTitle);
    if (result.length === 0) {
        await chrome.storage.sync.set({ currentBarTitle: title });
    }
};

export const handleCreate = async (id: string, bookmark: { title: string }) => {
    const customFolderId = await getCustomFolderId();
    chrome.bookmarks.onChanged.removeListener(handleUpdate);
    const title = await handleDuplicateName(customFolderId, bookmark.title);
    await chrome.bookmarks.update(id, { title });
    chrome.bookmarks.onChanged.addListener(handleUpdate);
};

export const handleMove = async (id: string) => {
    const customFolderId = await getCustomFolderId();
    if (id === customFolderId) {
        await init();
        return;
    }
    const bookmark = await chrome.bookmarks.get(id);
    if (bookmark[0].url) {
        return;
    }

    chrome.bookmarks.onChanged.removeListener(handleUpdate);
    const title = await handleDuplicateName(customFolderId, bookmark[0].title);
    await chrome.bookmarks.update(id, { title });
    chrome.bookmarks.onChanged.addListener(handleUpdate);
};

export const handleDelete = async (id: any, removeInfo: { node: { title: any } }) => {
    const customFolderId = await getCustomFolderId();
    if (id === customFolderId) {
        await init();
        return;
    }

    const currentBarTitle = await getCurrentBarTitle();
    if (removeInfo.node.title === currentBarTitle) {
        await chrome.bookmarks.create({
            parentId: customFolderId,
            title: currentBarTitle,
        });
    }
};

const SHORTCUT_DELAY = 100;
export const handleShortcut = debounce(async (command: string) => {
    const getNext = command === 'next-bar';
    const { customBarsId } = await chrome.storage.sync.get('customBarsId');
    const { currentBarTitle } = await chrome.storage.sync.get('currentBarTitle');
    if (!(typeof customBarsId === 'string') || !(typeof currentBarTitle === 'string')) {
        return;
    }
    const bookmarks = await chrome.bookmarks.getChildren(customBarsId);
    const bars = bookmarks.filter((bar) => !bar.url);
    if (bars.length === 0) {
        return;
    }

    if (/^switch-to-[1-9]$/u.test(command)) {
      const index = Number(command.split('-')[2]) - 1;
      const title = bars[index] ? bars[index].title : bars[0].title;
      if (title !== currentBarTitle) {
        await exchange(title);
      }
      return;
    }

    let title;
    const index = bars.map((b) => b.title).indexOf(currentBarTitle);
    if (getNext) {
        title = bars[index + 1] ? bars[index + 1].title : bars[0].title;
    } else {
        title = bars[index - 1] ? bars[index - 1].title : bars.at(-1)?.title;
    }
    await exchange(title ?? '');
}, SHORTCUT_DELAY);

function debounce(func: { (command: string): Promise<void> }, delay: number) {
    let timerId: NodeJS.Timeout | undefined;
    return function(...args: [string]) {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(async () => {
            await func(...args);
            timerId = undefined;
        }, delay);
    };
}
