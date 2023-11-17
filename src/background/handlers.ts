import { exchange, setupCurrentBar } from '~/background/service';
import { findFolder, getCustomDirectoryId, handleDuplicateName, isOperaBrowser } from '~/background/util';
import { getCurrentBarTitle, getLastWorkspaceId, updateCurrentBarTitle, updateLastWorkspaceId } from '~/background/storage';

/**
 * Handle updates to bookmarks.
 *
 * @param id - The bookmark id.
 * @param info - The info object containing title and url.
 */
/**
 * Handle updates to bookmarks.
 *
 * @param id - The bookmark id.
 * @param info - The info object containing title and url.
 */
export const handleUpdate = async (id: string, info: { title: string; url?: string }) => {
    if (info.url !== undefined) {
        return;
    }
    const customDirectoryId = await getCustomDirectoryId();
    const currentBarTitle = await getCurrentBarTitle();
    if (id === customDirectoryId) {
        await setupCurrentBar();
        return;
    }

    chrome.bookmarks.onChanged.removeListener(handleUpdate);
    const title = await handleDuplicateName(customDirectoryId, info.title);
    await chrome.bookmarks.update(id, { title });
    chrome.bookmarks.onChanged.addListener(handleUpdate);

    const result = await findFolder(customDirectoryId, currentBarTitle);
    if (result.length === 0) {
        await updateCurrentBarTitle(title);
    }
};

/**
 * Handle the creation of new bookmarks.
 *
 * @param id - The bookmark id.
 * @param bookmark - The bookmark object containing title and url.
 */
export const handleCreate = async (id: string, bookmark: { title: string; url?: string }) => {
    if (bookmark.url !== undefined) {
        return;
    }
    const customDirectoryId = await getCustomDirectoryId();
    chrome.bookmarks.onChanged.removeListener(handleUpdate);
    const title = await handleDuplicateName(customDirectoryId, bookmark.title);
    await chrome.bookmarks.update(id, { title });
    chrome.bookmarks.onChanged.addListener(handleUpdate);
};

/**
 * Handle the moving of bookmarks.
 *
 * @param id - The bookmark id.
 */
export const handleMove = async (id: string) => {
    const bookmark = await chrome.bookmarks.get(id);
    if (bookmark[0].url !== undefined) {
        return;
    }
    const customDirectoryId = await getCustomDirectoryId();
    if (id === customDirectoryId) {
        await setupCurrentBar();
        return;
    }
    chrome.bookmarks.onChanged.removeListener(handleUpdate);
    const title = await handleDuplicateName(customDirectoryId, bookmark[0].title);
    await chrome.bookmarks.update(id, { title });
    chrome.bookmarks.onChanged.addListener(handleUpdate);
};

/**
 * Handle the deletion of bookmarks.
 *
 * @param id - The bookmark id.
 * @param removeInfo - The remove info object containing information about the removed bookmark.
 */
export const handleDelete = async (id: string, removeInfo: { node: { title: string; url?: string } }) => {
    if (removeInfo.node.url !== undefined) {
        return;
    }
    const customDirectoryId = await getCustomDirectoryId();
    if (id === customDirectoryId) {
        await setupCurrentBar();
        return;
    }

    const currentBarTitle = await getCurrentBarTitle();
    if (removeInfo.node.title === currentBarTitle) {
        await chrome.bookmarks.create({
            parentId: customDirectoryId,
            title: currentBarTitle,
        });
    }
};

/**
 * Handle the switching of workspaces on Opera browser.
 * Switches to the active bar of the selected workspace
 * and updates the value of 'lastWorkspaceId'.
 *
 * @param _info - Info about the activated tab.
 */
export const handleWorkspaceSwitch = async (_info: chrome.tabs.TabActiveInfo) => {
    if (!isOperaBrowser()) {
        return;
    }
    const lastWorkspaceId = await getLastWorkspaceId();
    const currentBarTitle = await getCurrentBarTitle();
    const lastActiveBarTitle = await getCurrentBarTitle(lastWorkspaceId);
    await exchange(currentBarTitle, lastActiveBarTitle);
    await updateLastWorkspaceId();
};

const SHORTCUT_DELAY = 100;

/**
 * Handle switching of bookmark bars by shortcuts.
 *
 * @param command - The shortcut command to be handled.
 */
export const handleShortcut = debounce(async (command: string) => {
    const getNext = command === 'next-bar';
    const customDirectoryId = await getCustomDirectoryId();
    const currentBarTitle = await getCurrentBarTitle();
    const bookmarks = await chrome.bookmarks.getChildren(customDirectoryId);
    const bars = bookmarks.filter((bar) => !bar.url);
    if (bars.length === 0) {
        return;
    }

    if (/^switch-to-[1-9]$/u.test(command)) {
        const index = Number(command.split('-')[2]) - 1;
        const title = bars[index] ? bars[index].title : bars[0].title;
        await exchange(title);
        return;
    }

    let title;
    const index = bars.map((b) => b.title).indexOf(currentBarTitle);
    if (getNext) {
        title = bars[index + 1] ? bars[index + 1].title : bars[0].title;
    } else {
        title = bars[index - 1] ? bars[index - 1].title : bars.at(-1)?.title;
    }
    await exchange(title ?? '');
}, SHORTCUT_DELAY);

/**
 * Introduce a delay between shortcuts to avoid exceeding the MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE
 *
 * @param func - The function handling the shortcut.
 * @param delay - The delay in milliseconds.
 * @returns - The function handling the shortcut with the introduced delay.
 */
function debounce(func: { (command: string): Promise<void> }, delay: number) {
    let timerId: NodeJS.Timeout | undefined;
    return function(...args: [string]) {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(async () => {
            await func(...args);
            timerId = undefined;
        }, delay);
    };
}
