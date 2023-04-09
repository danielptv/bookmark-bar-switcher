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
 * @file This function is used for adding new bookmark bars.
 *
 * @author Daniel Purtov
 */

export async function addBar(title: string) {
    const { customBarsId } = await chrome.storage.sync.get('customBarsId');
    if (!(typeof customBarsId === 'string')) {
        return;
    }
    return chrome.bookmarks.create({
        parentId: customBarsId,
        title,
    });
}
