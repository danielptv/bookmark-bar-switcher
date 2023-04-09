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
 * @file This function is used for exchanging bookmark bars.
 *
 * @author Daniel Purtov
 */

import { findFolder, moveBookmark } from '~/background/service/util';

export async function exchangeBars(title: string) {
    const { customBarsId } = await chrome.storage.sync.get('customBarsId');
    const { bookmarkBarId } = await chrome.storage.sync.get('bookmarkBarId');
    if (
        !(typeof customBarsId === 'string') ||
        !(typeof bookmarkBarId === 'string')
    ) {
        return;
    }
    const [sourceId] = await findFolder(customBarsId, title);
    const result = await chrome.storage.sync.get('currentBarTitle');
    if (!(typeof result.currentBarTitle === 'string')) {
        return;
    }
    let [targetId] = await findFolder(customBarsId, result.currentBarTitle);
    if (!targetId) {
        const target = await chrome.bookmarks.create({
            parentId: customBarsId,
            title: result.currentBarTitle,
        });
        targetId = target.id;
    }

    // move the current bar to target folder
    await moveBookmark(bookmarkBarId, targetId);
    // move source folder to the main bar
    await moveBookmark(sourceId, bookmarkBarId);
    await chrome.storage.sync.set({ currentBarTitle: title });
}
