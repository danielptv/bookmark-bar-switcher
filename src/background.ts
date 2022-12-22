import {debug} from "./loggingUtil";
import {findFolder, handleDuplicateNames, moveBookmarks} from "./bookmarkUtil";


/**
 * Function for initializing the extension.
 */
async function initialize() {
    let bookmarks = await chrome.bookmarks.getTree()
    let bookmarkBarId = bookmarks[0].children[0].id;
    await chrome.storage.sync.set({"bookmarkBarId": bookmarkBarId});

    let customBarsId = await findFolder(bookmarks[0].children[1].id, "Bookmark Bars");
    if (customBarsId.length == 0) {
        customBarsId.push((await chrome.bookmarks.create({
            parentId: bookmarks[0].children[1].id,
            title: "Bookmark Bars"
        })).id);
    }
    await chrome.storage.sync.set({"customBarsId": customBarsId[0]});

    let currentBarTitle = (await chrome.storage.sync.get("currentBarTitle"))["currentBarTitle"];
    if (currentBarTitle == undefined) {
        await chrome.storage.sync.set({"currentBarTitle": "default"})
        currentBarTitle = "default";
    }

    debug("initialize(): bookmarkBarId: {}, customBarsId: {}, currentBarTitle: {}",
        bookmarkBarId, customBarsId[0], currentBarTitle);
}

/**
 * Function for exchanging bookmark bars.
 *
 * @param title Title of the bookmarked that should become the new main bar.
 */
async function exchangeBars(title: string) {
    debug("exchangeBars(): {}", title);
    const customBarsId = (await chrome.storage.sync.get("customBarsId"))["customBarsId"];
    const bookmarkBarId = (await chrome.storage.sync.get("bookmarkBarId"))["bookmarkBarId"];
    const sourceId = (await findFolder(customBarsId, title))[0];

    const result = await chrome.storage.sync.get("currentBarTitle");
    if (result["currentBarTitle"] == undefined) {
        throw("result undefined");
    }

    let targetId = (await findFolder(customBarsId, result["currentBarTitle"]))[0];
    if (!targetId) {
        targetId = (await chrome.bookmarks.create({
            parentId: customBarsId,
            title: result["currentBarTitle"]
        })).id;
    }

    //move current bar to target folder
    await moveBookmarks(bookmarkBarId, targetId);
    //move source folder to main bar
    await moveBookmarks(sourceId, bookmarkBarId);
    await chrome.storage.sync.set({"currentBarTitle": title});
    debug("exchangeBars() successful");
}

/**
 * Function for switching bars using the shortcuts.
 *
 * @param command The command name.
 */
async function handleShortcut(command: string) {
    debug("handleShortcut() command: {}", command);
    const getNext = command === "next-bar";
    const customBarsId = (await chrome.storage.sync.get("customBarsId"))["customBarsId"];
    const currentBarTitle = (await chrome.storage.sync.get("currentBarTitle"))["currentBarTitle"];
    const bars = (await chrome.bookmarks.getChildren(customBarsId));
    if (bars.length == 0) {
        return;
    }

    if((new RegExp("^switch-to-[1-9]$")).test(command)) {
        let index = Number(command.split("-")[2]);
        let title = bars[index] ? bars[index].title : bars[0].title;
        await exchangeBars(title);
        return;
    }

    let title;
    let index = (bars.map(b => b.title)).indexOf(currentBarTitle);
    if(getNext) {
        title = bars[index + 1] ? bars[index + 1].title : bars[0].title;
    } else {
        title = bars[index - 1] ? bars[index - 1].title : bars[bars.length - 1].title;
    }
    await exchangeBars(title);
    debug("handleShortcut() successful");
}

/**
 * Function for handling changes to bookmarks.
 *
 * @param id The bookmark id.
 * @param info A ChangeInfo object.
 */
async function handleBookmarkChange(id, info) {
    debug("handleBookmarkChange() id: {}, changeInfo: {}", id, info)
    const customBarsId = (await chrome.storage.sync.get("customBarsId"))["customBarsId"];
    if (id === customBarsId) {
        await initialize();
    }
    chrome.bookmarks.onChanged.removeListener(handleBookmarkChange);
    await handleDuplicateNames(id, customBarsId, info.title);
    await chrome.bookmarks.onChanged.addListener(handleBookmarkChange);
    debug("handleBookmarkChange() successful");
}


chrome.runtime.onInstalled.addListener(async () => await initialize());
chrome.bookmarks.onChanged.addListener(handleBookmarkChange);
chrome.bookmarks.onRemoved.addListener(async (id, removeInfo) => {
    if (removeInfo.node.title === "Bookmark Bars") {
        await initialize();
    }
});
chrome.bookmarks.onCreated.addListener(async (id, bookmark) => {
    const customBarsId = (await chrome.storage.sync.get("customBarsId"))["customBarsId"];

    chrome.bookmarks.onChanged.removeListener(handleBookmarkChange);
    await handleDuplicateNames(id, customBarsId, bookmark.title);
    chrome.bookmarks.onChanged.addListener(handleBookmarkChange);
});
chrome.bookmarks.onMoved.addListener(async (id) => {
    const customBarsId = (await chrome.storage.sync.get("customBarsId"))["customBarsId"];
    if (id === customBarsId) {
        await initialize();
    }
    let bookmark = await chrome.bookmarks.get(id);

    chrome.bookmarks.onChanged.removeListener(handleBookmarkChange);
    await handleDuplicateNames(id, customBarsId, bookmark[0].title);
    chrome.bookmarks.onChanged.addListener(handleBookmarkChange);
});
chrome.commands.onCommand.addListener(handleShortcut);
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.exchangeBars) {
        await exchangeBars(request.exchangeBars);
        await sendResponse({exchangeBars: "success"});
    }
})