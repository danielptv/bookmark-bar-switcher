import { type BookmarksBar, type BookmarksBarOpera, type OperaTab } from 'bookmarks';
import { findFolder, getCustomBars, getCustomDirectoryId, isOperaBrowser } from './util.ts';

const DEFAULT_TITLE = 'My first bookmark bar 🚀';
const STORED_BAR_KEY = 'storedBar';
const STORED_BARS_KEY = 'storedBars';
const LAST_WORKSPACE_ID_KEY = 'lastWorkspaceId';

/**
 * Get title of the currently active bookmarks bar from browser storage.
 *
 * @param workspaceId - The workspace id (optional).
 * @returns The title.
 */
export async function getActiveBar(workspaceId?: string) {
    if (isOperaBrowser()) {
        return getActiveBarOpera(workspaceId);
    }
    const customDirectoryId = await getCustomDirectoryId();
    let activeBar = await get<BookmarksBar>(STORED_BAR_KEY);

    // If an active bar is set update it in case it is outdated
    if (activeBar !== undefined) {
        activeBar = await findFolder(activeBar.id, customDirectoryId);
    }

    // If no active bar is set ...
    if (activeBar === undefined) {
        const customBars = await getCustomBars();
        // ... return the first custom bar if custom bars exist
        if (customBars.length > 0) {
            await set(STORED_BAR_KEY, customBars[0]);
            return customBars[0];
        }

        // ... otherwise create a default bar
        const defaultBar = await createDefaultBar();
        await set(STORED_BAR_KEY, defaultBar);
        return defaultBar;
    }
    return activeBar;
}

/**
 * Get title of current active bookmarks bar from browser storage on Opera browser.
 *
 * @param workspaceId - The workspace id (optional).
 * @returns The title.
 */
async function getActiveBarOpera(workspaceId?: string) {
    const actualWorkspaceId = workspaceId ?? (await getActiveWorkspaceId());
    const storedBars = (await get<BookmarksBarOpera[]>(STORED_BARS_KEY)) ?? ([] as BookmarksBarOpera[]);
    const activeBar = storedBars.filter((bar) => bar.workspaceId === actualWorkspaceId).at(0);

    if (activeBar === undefined) {
        let [finalActiveBar] = await getCustomBars();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (finalActiveBar === undefined) {
            finalActiveBar = await createDefaultBar();
        }

        storedBars.push({
            ...finalActiveBar,
            workspaceId: actualWorkspaceId,
        } as BookmarksBarOpera);
        await set(STORED_BARS_KEY, storedBars);
        return finalActiveBar;
    }
    return activeBar;
}

/**
 * Update current active bookmarks bar in browser storage.
 *
 * @param activeBar - The active bar.
 */
export async function updateActiveBar(activeBar: BookmarksBar) {
    if (isOperaBrowser()) {
        return updateActiveBarOpera(activeBar);
    }
    await set(STORED_BAR_KEY, activeBar);
}

/**
 * Update current active bookmarks bar in browser storage on Opera browser.
 *
 * @param activeBar - The active bar.
 */
async function updateActiveBarOpera(activeBar: BookmarksBar) {
    const storedBars = await get<BookmarksBarOpera[]>(STORED_BARS_KEY);

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
    await set(STORED_BARS_KEY, storedBars);
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
    const localData: Record<string, T> = await chrome.storage.local.get(key);

    if (Object.keys(localData).length === 0 || localData[key] === undefined) {
        const syncedData: Record<string, T> = await chrome.storage.sync.get(key);
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
    const data: Record<string, T> = {};
    data[key] = value;
    await chrome.storage.local.set(data);
    await chrome.storage.sync.set(data);
}

async function createDefaultBar() {
    const parentId = await getCustomDirectoryId();
    return (await chrome.bookmarks.create({
        parentId,
        title: DEFAULT_TITLE,
    })) as BookmarksBar;
}
