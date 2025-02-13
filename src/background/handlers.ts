import { checkWindowId, findFolder, getCustomDirectoryId } from '~/background/util.ts';
import { exchangeBars, install } from '~/background/service.ts';
import { getActiveBar, getLastWorkspaceId, updateLastWorkspaceId } from '~/background/storage.ts';

const SHORTCUT_DELAY = 100;

/**
 * Handle changes to bookmarks.
 *
 * @param _id - The bookmark id.
 * @param info - Info about the changed bookmark.
 */
export const handleChange = async (_id: string, info: { title: string; url?: string }) => {
    if (info.url !== undefined) {
        return;
    }
    await getCustomDirectoryId();
};

/**
 * Handle moving of bookmarks.
 *
 * @param id - The bookmark id.
 */
export const handleMove = async (id: string) => {
    const bookmark = await findFolder(id);
    if (bookmark === undefined) {
        return;
    }
    await getCustomDirectoryId();
};

/**
 * Handle removal of bookmarks.
 *
 * @param id - The bookmark id.
 * @param removeInfo - Info about the removed bookmark.
 */
export const handleRemove = async (id: string, removeInfo: { node: { title: string; url?: string } }) => {
    if (removeInfo.node.url !== undefined) {
        return;
    }
    const customDirectoryId = await getCustomDirectoryId();
    if (id === customDirectoryId) {
        await install();
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
    const validWindow = await checkWindowId(_info.windowId);
    if (!validWindow) {
        return;
    }

    const lastWorkspaceId = await getLastWorkspaceId();
    const currentBar = await getActiveBar();
    const lastActiveBar = await getActiveBar(lastWorkspaceId);
    await exchangeBars(currentBar.id, lastActiveBar.id);
    await updateLastWorkspaceId();
};

/**
 * Handles the creation of a new Browser window.
 * If it is the first created normal window, it sets it as the main window.
 *
 * @param window - The newly created window object.
 */
export const handleWindowCreate = async (window: chrome.windows.Window) => {
    if (window.id && window.type === 'normal') {
        console.log('New Window created:', window.id);
        await checkWindowId(window.id);
    } else {
        console.warn('Window is not normal:', window);
    }
};

/**
 * Handle switching of bookmark bars by shortcuts.
 *
 * @param command - The shortcut command to be handled.
 */
export const handleShortcut = debounce(async (command: string) => {
    const getNext = command === 'next-bar';
    const customDirectoryId = await getCustomDirectoryId();
    const activeBar = await getActiveBar();
    const bookmarks = await chrome.bookmarks.getChildren(customDirectoryId);
    const bookmarksBars = bookmarks.filter((bar) => !bar.url);

    if (bookmarksBars.length === 0) {
        return;
    }

    if (/^switch-to-[1-9]$/u.test(command)) {
        const index = Number(command.split('-')[2]) - 1;
        const activatedId = bookmarksBars[index] ? bookmarksBars[index].id : bookmarksBars[0].id;
        await exchangeBars(activatedId);
        return;
    }

    let activatedId;
    const activeBarIndex = bookmarksBars.map((b) => b.id).indexOf(activeBar.id);
    if (getNext) {
        activatedId = bookmarksBars[activeBarIndex + 1] ? bookmarksBars[activeBarIndex + 1].id : bookmarksBars[0].id;
    } else {
        activatedId = bookmarksBars[activeBarIndex - 1]
            ? bookmarksBars[activeBarIndex - 1].id
            : bookmarksBars.at(-1)?.id;
    }
    await exchangeBars(activatedId ?? '');
}, SHORTCUT_DELAY);

/**
 * Introduce a delay between shortcuts to avoid exceeding the MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE.
 *
 * @param func - The function handling the shortcut.
 * @param delay - The delay in milliseconds.
 * @returns - The function handling the shortcut with the introduced delay.
 */
function debounce(func: (command: string) => Promise<void>, delay: number) {
    let timerId: NodeJS.Timeout | undefined;
    return function (...args: [string]) {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(async () => {
            await func(...args);
            timerId = undefined;
        }, delay);
    };
}
