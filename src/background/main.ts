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

import { handleCreate, handleDelete, handleMove, handleShortcut, handleUpdate } from '~/background/handlers';
import { setupCurrentBar } from '~/background/service';

chrome.runtime.onInstalled.addListener(setupCurrentBar);
chrome.bookmarks.onChanged.addListener(handleUpdate);
chrome.bookmarks.onRemoved.addListener(handleDelete);
chrome.bookmarks.onCreated.addListener(handleCreate);
chrome.bookmarks.onMoved.addListener(handleMove);
chrome.commands.onCommand.addListener(handleShortcut);
