/**
 * @licence Copyright (C) 2022 - present Daniel Purtov
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @file This section contains utility functions for operations on
 * the chrome.bookmarks API.
 *
 * @author Daniel Purtov
 */

import { debug } from "./loggingUtil";

/**
 * Find a bookmark or a bookmark folder by title within a parent folder.
 *
 * @param parentId ID of the parent folder.
 * @param title Title of the sought bookmark.
 */
export async function findFolder(
  parentId: string,
  title: string
): Promise<string[]> {
  debug("findFolder() parentId:" + parentId + " title:" + title);
  let result = [];
  let children = await chrome.bookmarks.getChildren(parentId);
  for (const item of children) {
    if (item.title === title) {
      result.push(item.id);
    }
  }
  debug("findFolder() successful");
  return result;
}

/**
 * Move a bookmark or a bookmark folder.
 *
 * @param sourceId ID of the source folder.
 * @param targetId ID of the target folder.
 */
export async function moveBookmark(sourceId: string, targetId: string) {
  debug("moveBookmarks() sourceId: {}, targetId: {}", sourceId, targetId);
  const srcBookmarks = await chrome.bookmarks.getChildren(sourceId);
  for (const item of srcBookmarks) {
    await chrome.bookmarks.move(item.id, { parentId: targetId });
  }
  debug("moveBookmarks() successful");
}

/**
 * Handle duplicate bookmark folder names by adding "_<number>" as postfix where necessary.
 *
 * @param id ID of the bookmark folder.
 * @param parentId ID of the parent folder.
 * @param title Title of the bookmark folder.
 */
export async function handleDuplicateName(
  id: string,
  parentId: string,
  title: string
) {
  debug(
    "handleDuplicateNames() id: {}, parentId: {}, title: {}",
    id,
    parentId,
    title
  );
  let parentFolder = (await chrome.bookmarks.getChildren(parentId)).map(
    (child) => child.title
  );
  let count = parentFolder.filter((childTitle) => childTitle == title);

  if (count.length > 1) {
    let postfix = 1;
    while (parentFolder.includes(title + "_" + postfix.toString())) {
      postfix++;
    }
    debug(
      "handleDuplicateNames() newTitle: {}",
      title + "_" + postfix.toString()
    );
    return title + "_" + postfix.toString();
  }
  debug("handleDuplicateNames() newTitle: {}", title);
  return title;
}
