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
 * @file This function is used for reordering bookmark bars.
 *
 * @author Daniel Purtov
 */

import { getCustomBars } from "~/background/service/util";

export async function reorderBars(
    arr: { id: string, title: string, isActive: boolean, editMode: boolean }[],
    reorderResult: { removedIndex: number | null; addedIndex: number | null; },
) {
    const { removedIndex, addedIndex } = reorderResult;
    if (removedIndex === null ||
        addedIndex === null ||
        removedIndex === addedIndex) {
        return arr;
    }

    const customBars = await getCustomBars();
    const movedBar = customBars[removedIndex];
    await chrome.bookmarks.move(movedBar.id,
        {
            // need to increment the index by 1 when moving a bar downwards
            index: addedIndex < removedIndex ? addedIndex : addedIndex + 1,
            parentId: movedBar.parentId,
        },
    );
    const [element] = arr.splice(removedIndex, 1);
    arr.splice(addedIndex, 0, element);
    return arr;
}
