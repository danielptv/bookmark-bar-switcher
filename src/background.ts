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
 * @file This is the backend section of the Bookmark Bar Switcher where
 * the operations on the chrome.bookmarks API are being executed.
 *
 * @author Daniel Purtov
 */
import { debug } from "./loggingUtil";
import { findFolder, handleDuplicateName, moveBookmark } from "./bookmarkUtil";

/**
 * Initialize the extension.
 */
async function initialize() {
  let bookmarks = await chrome.bookmarks.getTree();
  let bookmarkBarId = bookmarks[0].children[0].id;
  await chrome.storage.sync.set({ bookmarkBarId: bookmarkBarId });

  let customBarsId = await findFolder(
    bookmarks[0].children[1].id,
    "Bookmark Bars"
  );
  if (customBarsId.length == 0) {
    customBarsId.push(
      (
        await chrome.bookmarks.create({
          parentId: bookmarks[0].children[1].id,
          title: "Bookmark Bars",
        })
      ).id
    );
  }
  await chrome.storage.sync.set({ customBarsId: customBarsId[0] });

  let currentBarTitle = (await chrome.storage.sync.get("currentBarTitle"))[
    "currentBarTitle"
  ];
  if (!currentBarTitle) {
    await chrome.storage.sync.set({ currentBarTitle: "default" });
    currentBarTitle = "default";
  }

  debug(
    "initialize(): bookmarkBarId: {}, customBarsId: {}, currentBarTitle: {}",
    bookmarkBarId,
    customBarsId[0],
    currentBarTitle
  );
}

/**
 * Switch two bookmark bars.
 *
 * @param title Title of the bookmarked that should become the new main bar.
 */
async function exchangeBars(title: string) {
  debug("exchangeBars(): {}", title);
  const customBarsId = (await chrome.storage.sync.get("customBarsId"))[
    "customBarsId"
  ];
  const bookmarkBarId = (await chrome.storage.sync.get("bookmarkBarId"))[
    "bookmarkBarId"
  ];
  const sourceId = (await findFolder(customBarsId, title))[0];
  const result = await chrome.storage.sync.get("currentBarTitle");

  let targetId = (await findFolder(customBarsId, result["currentBarTitle"]))[0];
  if (!targetId) {
    targetId = (
      await chrome.bookmarks.create({
        parentId: customBarsId,
        title: result["currentBarTitle"],
      })
    ).id;
  }

  //move current bar to target folder
  await moveBookmark(bookmarkBarId, targetId);
  //move source folder to main bar
  await moveBookmark(sourceId, bookmarkBarId);
  await chrome.storage.sync.set({ currentBarTitle: title });
  debug("exchangeBars() successful");
}

/**
 * Switch two bookmark bars using shortcuts.
 *
 * @param command The command name.
 */
async function handleShortcut(command: string) {
  debug("handleShortcut() command: {}", command);
  const getNext = command === "next-bar";
  const customBarsId = (await chrome.storage.sync.get("customBarsId"))[
    "customBarsId"
  ];
  const currentBarTitle = (await chrome.storage.sync.get("currentBarTitle"))[
    "currentBarTitle"
  ];
  const bars = (await chrome.bookmarks.getChildren(customBarsId)).filter(
    (bar) => !bar.url
  );
  if (bars.length == 0) {
    return;
  }

  if (new RegExp("^switch-to-[1-9]$").test(command)) {
    let index = Number(command.split("-")[2]);
    let title = bars[index] ? bars[index].title : bars[0].title;
    await exchangeBars(title);
    return;
  }

  let title;
  let index = bars.map((b) => b.title).indexOf(currentBarTitle);
  if (getNext) {
    title = bars[index + 1] ? bars[index + 1].title : bars[0].title;
  } else {
    title = bars[index - 1]
      ? bars[index - 1].title
      : bars[bars.length - 1].title;
  }
  await exchangeBars(title);
  debug("handleShortcut() successful");
}

/**
 * Handle changes to bookmarks.
 *
 * @param id The bookmark id.
 * @param info A ChangeInfo object.
 */
const handleBookmarkChange = async (id, info) => {
  debug("handleBookmarkChange() id: {}, changeInfo: {}", id, info);
  const customBarsId = (await chrome.storage.sync.get("customBarsId"))[
    "customBarsId"
  ];
  if (id === customBarsId) {
    await initialize();
    return;
  }

  chrome.bookmarks.onChanged.removeListener(handleBookmarkChange);
  const title = await handleDuplicateName(id, customBarsId, info.title);
  await chrome.bookmarks.update(id, {
    title: title,
  });
  await chrome.bookmarks.onChanged.addListener(handleBookmarkChange);

  const currentBarTitle = (await chrome.storage.sync.get("currentBarTitle"))[
    "currentBarTitle"
  ];
  if ((await findFolder(customBarsId, currentBarTitle)).length === 0) {
    await chrome.storage.sync.set({ currentBarTitle: title });
  }
  debug("handleBookmarkChange() successful");
};

/**
 * Handle removal of bookmarks.
 *
 * @param id The bookmark id.
 * @param removeInfo A RemoveInfo object.
 */
const handleBookmarkRemoval = async (id, removeInfo) => {
  const customBarsId = (await chrome.storage.sync.get("customBarsId"))[
    "customBarsId"
  ];
  if (id === customBarsId) {
    await initialize();
    return;
  }

  const currentBarTitle = (await chrome.storage.sync.get("currentBarTitle"))[
    "currentBarTitle"
  ];
  if (removeInfo.node.title === currentBarTitle) {
    const customBarsId = (await chrome.storage.sync.get("customBarsId"))[
      "customBarsId"
    ];
    await chrome.bookmarks.create({
      parentId: customBarsId,
      title: currentBarTitle,
    });
  }
};

/**
 * Handle bookmark creation.
 *
 * @param id The bookmark id.
 * @param bookmark The bookmark object.
 */
const handleBookmarkCreation = async (id, bookmark) => {
  const customBarsId = (await chrome.storage.sync.get("customBarsId"))[
    "customBarsId"
  ];

  chrome.bookmarks.onChanged.removeListener(handleBookmarkChange);
  const title = await handleDuplicateName(id, customBarsId, bookmark.title);
  await chrome.bookmarks.update(id, {
    title: title,
  });
  chrome.bookmarks.onChanged.addListener(handleBookmarkChange);
};

/**
 * Handle moving bookmarks.
 *
 * @param id The bookmark id.
 */
const handleBookmarkMove = async (id) => {
  const customBarsId = (await chrome.storage.sync.get("customBarsId"))[
    "customBarsId"
  ];
  if (id === customBarsId) {
    await initialize();
    return;
  }
  let bookmark = await chrome.bookmarks.get(id);

  chrome.bookmarks.onChanged.removeListener(handleBookmarkChange);
  const title = await handleDuplicateName(id, customBarsId, bookmark[0].title);
  await chrome.bookmarks.update(id, {
    title: title,
  });
  chrome.bookmarks.onChanged.addListener(handleBookmarkChange);
};

chrome.runtime.onInstalled.addListener(async () => await initialize());
chrome.bookmarks.onChanged.addListener(handleBookmarkChange);
chrome.bookmarks.onRemoved.addListener(handleBookmarkRemoval);
chrome.bookmarks.onCreated.addListener(handleBookmarkCreation);
chrome.bookmarks.onMoved.addListener(handleBookmarkMove);
chrome.commands.onCommand.addListener(handleShortcut);
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.exchangeBars) {
    await exchangeBars(request.exchangeBars);
    await sendResponse({ exchangeBars: "success" });
  }
});
