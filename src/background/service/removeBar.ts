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
 * @file This function is used for removing bookmark bars.
 *
 * @author Daniel Purtov
 */

import { findFolder, getCustomBars } from "~/background/service/util";
import { exchangeBars } from "~/background/service/exchangeBars";


export async function removeBar(id: string) {
    const { customBarsId } = await chrome.storage.sync.get('customBarsId');
    let { currentBarTitle } = await chrome.storage.sync.get(
        'currentBarTitle',
    );
    if (
        !(typeof customBarsId === 'string') ||
        !(typeof currentBarTitle === 'string')
    ) {
        return;
    }

    const currentBarId = await findFolder(customBarsId, currentBarTitle);
    const customBars = await getCustomBars();
    if (customBars.length === 1) {
        return;
    }
    const barsIds = customBars.map((customBar) => customBar.id);
    if (id === currentBarId[0]) {
        const currentIndex = barsIds.indexOf(id);
        const updatedIndex = currentIndex === 0
            ? barsIds.length - 1
            : currentIndex - 1;
        await exchangeBars(customBars[updatedIndex].title);
        await chrome.storage.sync.set(
            { currentBarTitle: customBars[updatedIndex].title },
        );
        currentBarTitle = customBars[updatedIndex].title;
        if (!(typeof currentBarTitle === 'string')) {
            return;
        }
    }
    await chrome.bookmarks.removeTree(id);
    return currentBarTitle;
}
