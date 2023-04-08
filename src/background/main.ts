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
 * @file This is the main entry point of the service worker handling all
 * relevant events.
 *
 * @author Daniel Purtov
 */

import { handleBookmarkChange } from '~/background/handlers/handleBookmarkChange';
import { handleBookmarkCreation } from '~/background/handlers/handleBookmarkCreation';
import { handleBookmarkMove } from '~/background/handlers/handleBookmarkMove';
import { handleBookmarkRemoval } from '~/background/handlers/handleBookmarkRemoval';
import { handleShortcut } from '~/background/handlers/handleShortcut';
import { init } from '~/background/service/init';

chrome.runtime.onInstalled.addListener(() => init());
chrome.bookmarks.onChanged.addListener(handleBookmarkChange);
chrome.bookmarks.onRemoved.addListener(handleBookmarkRemoval);
chrome.bookmarks.onCreated.addListener(handleBookmarkCreation);
chrome.bookmarks.onMoved.addListener(handleBookmarkMove);
chrome.commands.onCommand.addListener(handleShortcut);
