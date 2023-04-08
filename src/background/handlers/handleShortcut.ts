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
 * @file This is the handler for the plugin keyboard shortcuts.
 *
 * @author Daniel Purtov
 */

import { exchangeBars } from '~/background/service/exchangeBars';

export async function handleShortcut(command: string) {
    const getNext = command === 'next-bar';
    const { customBarsId } = await chrome.storage.sync.get('customBarsId');
    const { currentBarTitle } = await chrome.storage.sync.get(
        'currentBarTitle',
    );
    if (
        !(typeof customBarsId === 'string') ||
        !(typeof currentBarTitle === 'string')
    ) {
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
        await exchangeBars(title);
        return;
    }

    let title;
    const index = bars.map((b) => b.title).indexOf(currentBarTitle);
    if (getNext) {
        title = bars[index + 1] ? bars[index + 1].title : bars[0].title;
    } else {
        title = bars[index - 1]
            ? bars[index - 1].title
            : bars[bars.length - 1].title;
    }
    await exchangeBars(title);
}
