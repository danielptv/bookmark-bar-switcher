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
 * @file This function is used for initializing the plugin.
 *
 * @author Daniel Purtov
 */

import { findFolder } from '~/background/service/util';

export async function init() {
    const bookmarks = await chrome.bookmarks.getTree();
    if (bookmarks[0].children === undefined) {
        return;
    }
    const bookmarkBarId = bookmarks[0].children[0].id;
    await chrome.storage.sync.set({ bookmarkBarId });
    const customBarsId = await findFolder(
        bookmarks[0].children[1].id,
        'Bookmark Bars',
    );
    if (customBarsId.length === 0) {
        const customBar = await chrome.bookmarks.create({
            parentId: bookmarks[0].children[1].id,
            title: 'Bookmark Bars',
        });
        customBarsId.push(customBar.id);
    }
    await chrome.storage.sync.set({ customBarsId: customBarsId[0] });

    const { currentBarTitle } = await chrome.storage.sync.get(
        'currentBarTitle',
    );
    if (currentBarTitle === undefined) {
        await chrome.storage.sync.set({ currentBarTitle: 'default' });
    }
}
