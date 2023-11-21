import { exchange, setupCurrentBar } from '~/background/service';
import { getActiveBar, getLastWorkspaceId, updateLastWorkspaceId } from '~/background/storage';
import { getCustomDirectoryId, isOperaBrowser } from '~/background/util';

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
    if (id === customDirectoryId) {
        await setupCurrentBar();
        return;
    }
    await getActiveBar();
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
    await getActiveBar();
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

    await getActiveBar();
};

/**
 * Handle the switching of workspaces on Opera browser.
 * Switches to the active bar of the selected workspace
 * and updates the value of 'lastWorkspaceId'.
 *
 * @param _info - Info about the activated tab.
 */
export const handleWorkspaceSwitch = async (_info: chrome.tabs.TabActiveInfo) => {
    const lastWorkspaceId = await getLastWorkspaceId();
    const currentBar = await getActiveBar();
    const lastActiveBar = await getActiveBar(lastWorkspaceId);
    await exchange(currentBar.id, lastActiveBar.id);
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
    const currentBar = await getActiveBar();
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

    let id;
    const index = bars.map((b) => b.id).indexOf(currentBar.id);
    if (getNext) {
        id = bars[index + 1] ? bars[index + 1].id : bars[0].id;
    } else {
        id = bars[index - 1] ? bars[index - 1].id : bars.at(-1)?.id;
    }
    await exchange(id ?? '');
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
