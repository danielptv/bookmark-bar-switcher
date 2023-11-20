import { type BookmarksBar, type BookmarksBarOpera, type OperaTab } from '~/background/workspace';
import { findFolder, getCustomBars, getCustomDirectoryId, isOperaBrowser } from './util';

const DEFAULT_CURRENT_TITLE = 'My first bookmark bar 🚀';
const CURRENT_BAR_KEY = 'currentBar';
const CURRENT_BARS_KEY = 'currentBars';
const LAST_WORKSPACE_ID_KEY = 'lastWorkspaceId';

/**
 * Get title of the currently active bookmarks bar from browser storage.
 *
 * @param workspaceId - The workspace id (optional).
 * @returns The title.
 */
export async function getCurrentBar(workspaceId?: string) {
    if (isOperaBrowser()) {
        return getCurrentBarOpera(workspaceId);
    }
    const customDirectoryId = await getCustomDirectoryId();
    let currentBar = await get<BookmarksBar>(CURRENT_BAR_KEY);
    if (currentBar !== undefined) {
        currentBar = await findFolder(currentBar.id, customDirectoryId);
    }

    if (currentBar === undefined) {
        const customBars = await getCustomBars();
        if (customBars.length > 0) {
            await set(CURRENT_BAR_KEY, customBars[0]);
            return customBars[0];
        }

        const defaultBar = (await chrome.bookmarks.create({
            parentId: customDirectoryId,
            title: DEFAULT_CURRENT_TITLE,
        })) as BookmarksBar;
        await set(CURRENT_BAR_KEY, defaultBar);
        return defaultBar;
    }
    return currentBar;
}

/**
 * Get title of current active bookmarks bar from browser storage on Opera browser.
 *
 * @param workspaceId - The workspace id (optional).
 * @returns The title.
 */
async function getCurrentBarOpera(workspaceId?: string) {
    const actualWorkspaceId = workspaceId ?? (await getActiveWorkspaceId());
    const storedBars = (await get<BookmarksBarOpera[]>(CURRENT_BARS_KEY)) ?? ([] as BookmarksBarOpera[]);
    const currentBar = storedBars.filter((bar) => bar.workspaceId === actualWorkspaceId).at(0);

    if (currentBar === undefined) {
        let [finalCurrentBar] = await getCustomBars();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (finalCurrentBar === undefined) {
            const parentId = await getCustomDirectoryId();
            finalCurrentBar = (await chrome.bookmarks.create({
                parentId,
                title: DEFAULT_CURRENT_TITLE,
            })) as BookmarksBar;
        }

        storedBars.push({
            ...finalCurrentBar,
            workspaceId: actualWorkspaceId,
        } as BookmarksBarOpera);
        await set(CURRENT_BARS_KEY, storedBars);
        return finalCurrentBar;
    }
    return currentBar;
}

/**
 * Update current active bookmarks bar in browser storage.
 *
 * @param activeBar - The active bar.
 */
export async function updateCurrentBar(activeBar: BookmarksBar) {
    if (isOperaBrowser()) {
        return updateCurrentBarOpera(activeBar);
    }
    await set(CURRENT_BAR_KEY, activeBar);
}

/**
 * Update current active bookmarks bar in browser storage on Opera browser.
 *
 * @param activeBar - The active bar.
 */
async function updateCurrentBarOpera(activeBar: BookmarksBar) {
    const storedBars = await get<BookmarksBarOpera[]>(CURRENT_BARS_KEY);

    // Extension was not installed correctly
    if (storedBars === undefined) {
        return;
    }

    const workspaceId = await getActiveWorkspaceId();
    const activeWorkspaceIndex = storedBars.findIndex((bar) => bar.workspaceId === workspaceId);
    if (activeWorkspaceIndex === -1) {
        storedBars.push({ ...activeBar, workspaceId });
    } else {
        storedBars[activeWorkspaceIndex] = { ...activeBar, workspaceId };
    }
    await set(CURRENT_BARS_KEY, storedBars);
}

/**
 * Get id of the workspace selected before the currently active workspace from browser storage.
 *
 * @returns The id.
 */
export function getLastWorkspaceId() {
    return get<string>(LAST_WORKSPACE_ID_KEY);
}

/**
 * Update id of the workspace selected before the currently active workspace in browser storage.
 */
export async function updateLastWorkspaceId() {
    const lastWorkspaceId = await getActiveWorkspaceId();
    await set(LAST_WORKSPACE_ID_KEY, lastWorkspaceId);
}

/**
 * Get the active workspace id.
 *
 * @returns The id.
 */
async function getActiveWorkspaceId() {
    const tabs = (await chrome.tabs.query({ active: true, lastFocusedWindow: true })) as OperaTab[];
    const tab = tabs.at(0);
    return tab === undefined ? '0' : tab.workspaceId;
}

/**
 * Get an entry from the browser storage.
 * The synced storage will only be accessed
 * if the key is not present in the local storage.
 *
 * @param key - The entry key.
 * @returns The entry.
 */
async function get<T>(key: string): Promise<T | undefined> {
    const localData: { [key: string]: T } = await chrome.storage.local.get(key);

    if (Object.keys(localData).length === 0 || localData[key] === undefined) {
        const syncedData: { [key: string]: T } = await chrome.storage.sync.get(key);
        if (Object.keys(syncedData).length === 0 || syncedData[key] === undefined) {
            return undefined;
        }
        return syncedData[key];
    }
    return localData[key];
}

/**
 * Set an entry in the browser storage.
 * The entry will be set in both local
 * and synced storage.
 * @param key - The entry key.
 * @param value - The entry value.
 */
async function set<T>(key: string, value: T) {
    const data: { [key: string]: T } = {};
    data[key] = value;
    await chrome.storage.local.set(data);
    await chrome.storage.sync.set(data);
}
