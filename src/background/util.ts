const CUSTOM_DIRECTORY = 'Bookmark Bars';

export async function findFolder(parentId: string, title: string): Promise<string[]> {
    const children = await chrome.bookmarks.getChildren(parentId);
    return children.filter((child) => child.title === title).map((child) => child.id);
}

export async function moveBookmark(sourceId: string, targetId: string) {
    const srcBookmarks = await chrome.bookmarks.getChildren(sourceId);
    for (const item of srcBookmarks) {
        await chrome.bookmarks.move(item.id, { parentId: targetId });
    }
}

export async function handleDuplicateName(parentId: string, title: string) {
    const parent = await chrome.bookmarks.getChildren(parentId);
    const parentFolder = parent.map((child) => child.title);
    const count = parentFolder.filter((childTitle) => childTitle === title);

    if (count.length > 1) {
        let postfix = 1;
        while (parentFolder.includes(`${title}_${postfix.toString()}`)) {
            postfix++;
        }
        return `${title}_${postfix.toString()}`;
    }
    return title;
}

export async function getCustomDirectoryId() {
    const bookmarks = await chrome.bookmarks.getTree();
    if (bookmarks[0].children === undefined) {
        return '';
    }
    const id = await findFolder(bookmarks[0].children[1].id, CUSTOM_DIRECTORY);
    if (id.length > 0) {
        return id[0];
    }

    const parenFolderId = isOperaBrowser() ? "5" : "2";
    const created = await chrome.bookmarks.create({
        parentId: parenFolderId,
        title: CUSTOM_DIRECTORY,
    });
    return created.id;
}

export async function getBookmarksBarId() {
    const bookmarks = await chrome.bookmarks.getTree();
    if (bookmarks[0].children === undefined) {
        return '';
    }
    return bookmarks[0].children[0].id;
}

export async function getCustomBars() {
    const customDirectoryId = await getCustomDirectoryId();
    const bookmarks = await chrome.bookmarks.getChildren(customDirectoryId);
    return bookmarks.filter((bar) => !bar.url);
}

export function isOperaBrowser() {
    return navigator.userAgent.includes(' OPR/');
}

// Function to convert a proxy array to a normal array with json parse
export function convertProxyArray<T>(array: T[]) {
    return JSON.parse(JSON.stringify(array)) as T[];
}

// Function to convert a proxy object to a normal object with json parse
export function convertProxyObject(object: object) {
    return JSON.parse(JSON.stringify(object)) as object;
}
