import {debug} from "./loggingUtil";

/**
 * Utility function for finding a bookmark or a bookmark folder by title within a parent folder.
 *
 * @param parentId ID of the parent folder.
 * @param title Title of the sought bookmark.
 */
export async function findFolder(parentId: string, title: string): Promise<string[]> {
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
 * Utility function for moving bookmarks.
 *
 * @param sourceId ID of the source folder.
 * @param targetId ID of the target folder.
 */
export async function moveBookmarks(sourceId: string, targetId: string) {
    debug("moveBookmarks() sourceId: {}, targetId: {}", sourceId, targetId);
    const srcBookmarks = await chrome.bookmarks.getChildren(sourceId);
    for (const item of srcBookmarks) {
        await chrome.bookmarks.move(item.id, {parentId: targetId});
    }
    debug("moveBookmarks() successful");
}

/**
 * Utility function for handling duplicate bookmark folder names.
 *
 * @param id ID of the bookmark folder.
 * @param parentId ID of the parent folder.
 * @param title Title of the bookmark folder.
 */
export async function handleDuplicateNames(id: string, parentId: string, title: string) {
    debug("handleDuplicateNames() id: {}, parentId: {}, title: {}", id, parentId, title);
    let parentFolder = (await chrome.bookmarks.getChildren(parentId)).map(child => child.title);
    let count = parentFolder.filter(childTitle => childTitle == title);

    if(count.length > 1) {
        let postfix = 1;
        while(parentFolder.includes(title + "_" + postfix.toString())) {
            postfix++;
        }
        await chrome.bookmarks.update(id, {title: title + "_" + postfix.toString()});
    }
    debug("handleDuplicateNames() successful");
}


