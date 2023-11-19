import { type BookmarksBar, type BookmarksBarOpera, type OperaTab } from '~/background/workspace';
import { findFolder, getCustomBars, getCustomDirectoryId, isOperaBrowser } from './util';

const DEFAULT_CURRENT_TITLE = 'My first bookmark bar 🚀';
const CURRENT_BAR_KEY = 'currentBar';
const CURRENT_BARS_KEY = 'currentBars';
const LAST_WORKSPACE_ID_KEY = 'lastWorkspaceId';

/**
 * Get the title of the currently active bookmarks bar from the browser storage.
 *
 * @returns The title of the currently active bookmarks bar.
 */
export async function getCurrentBar(workspaceId?: string) {
    if (isOperaBrowser()) {
        return getCurrentBarOpera(workspaceId);
    }
    const parentId = await getCustomDirectoryId();
    let currentBar = await get<BookmarksBar>(CURRENT_BAR_KEY);
    if (currentBar !== undefined) {
        currentBar = await findFolder(currentBar.id, parentId);
    }

    if (currentBar === undefined) {
        const customBars = await getCustomBars();
        if (customBars.length > 0) {
            await set(CURRENT_BAR_KEY, customBars[0]);
            return customBars[0];
        }

        const createdBar = await chrome.bookmarks.create({ parentId, title: DEFAULT_CURRENT_TITLE });
        const defaultBar = { id: createdBar.id, title: createdBar.title } as BookmarksBar;
        await set(CURRENT_BAR_KEY, defaultBar);
        return defaultBar;
    }
    return currentBar;
}

/**
 * Get the title of the currently active bookmarks bar from the browser storage on Opera browser.
 *
 * @returns The title of the currently active bookmarks bar.
 */
async function getCurrentBarOpera(workspaceId?: string) {
    const id = workspaceId ?? (await getCurrentWorkspaceId());
    const currentBarsInfo = (await get<BookmarksBarOpera[]>(CURRENT_BARS_KEY)) ?? ([] as BookmarksBarOpera[]);

    const currentBar = currentBarsInfo.filter((bar) => bar.workspaceId === id).at(0);

    if (currentBar === undefined) {
        const customBars = await getCustomBars();
        let finalCurrentBar;
        if (customBars.length > 0) {
            finalCurrentBar = { id: customBars[0].id, title: customBars[0].title } as BookmarksBar;
        } else {
            const parentId = await getCustomDirectoryId();
            const createdBar = await chrome.bookmarks.create({ parentId, title: DEFAULT_CURRENT_TITLE });
            finalCurrentBar = { id: createdBar.id, title: createdBar.title } as BookmarksBar;
        }

        currentBarsInfo.push({
            id: finalCurrentBar.id,
            title: finalCurrentBar.title,
            workspaceId: id,
        } as BookmarksBarOpera);
        await set(CURRENT_BARS_KEY, currentBarsInfo);
        return finalCurrentBar;
    }
    return currentBar;
}

/**
 * Update the title of the currently active bookmarks bar in the browser storage.
 *
 * @param currentBar - The current bar title.
 */
export async function updateCurrentBar(currentBar: BookmarksBar) {
    if (isOperaBrowser()) {
        return updateCurrentBarOpera(currentBar);
    }
    await set(CURRENT_BAR_KEY, currentBar);
}

/**
 * Update the title of the currently active bookmarks bar in the browser storage on Opera browser.
 *
 * @param currentBar - The current bar title.
 */
async function updateCurrentBarOpera(currentBar: BookmarksBar) {
    const workspaceId = await getCurrentWorkspaceId();

    const currentBarsInfo = await get<BookmarksBarOpera[]>(CURRENT_BARS_KEY);

    if (currentBarsInfo === undefined) {
        return;
    }
    const index = currentBarsInfo.findIndex((info) => info.workspaceId === workspaceId);
    if (index === -1) {
        currentBarsInfo.push({ id: currentBar.id, title: currentBar.title, workspaceId });
    } else {
        currentBarsInfo[index].title = currentBar.title;
    }
    await set(CURRENT_BARS_KEY, currentBarsInfo);
}

/**
 * Get the id of the previously selected workspace from browser storage.
 *
 * @returns The id.
 */
export function getLastWorkspaceId() {
    return get<string>(LAST_WORKSPACE_ID_KEY);
}

/**
 * Update the id of the previously selected workspace in the browser storage.
 */
export async function updateLastWorkspaceId() {
    const lastWorkspaceId = await getCurrentWorkspaceId();
    await set(LAST_WORKSPACE_ID_KEY, lastWorkspaceId);
}

/**
 * Retrieve the current workspace id.
 *
 * @returns The workspace id.
 */
async function getCurrentWorkspaceId() {
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
