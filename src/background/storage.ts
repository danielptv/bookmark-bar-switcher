import { type CurrentBarInfo, type OperaTab } from '~/background/workspace';
import { getCustomBars, isOperaBrowser } from './util';

const DEFAULT_CURRENT_TITLE = 'My first bookmark bar 🚀';
const CURRENT_BAR_TITLE_KEY = 'currentBarTitle';
const CURRENT_BARS_INFO_KEY = 'currentBarsInfo';
const LAST_WORKSPACE_ID_KEY = 'lastWorkspaceId';

/**
 * Get the title of the currently active bookmarks bar from the browser storage.
 *
 * @returns The title of the currently active bookmarks bar.
 */
export async function getCurrentBarTitle(workspaceId?: string) {
    if (isOperaBrowser()) {
        return getCurrentBarTitleOpera(workspaceId);
    }
    const currentBarTitle = await get<string>(CURRENT_BAR_TITLE_KEY);
    if (currentBarTitle === undefined) {
        await set(CURRENT_BAR_TITLE_KEY, DEFAULT_CURRENT_TITLE);
        return DEFAULT_CURRENT_TITLE;
    }
    return currentBarTitle;
}

/**
 * Get the title of the currently active bookmarks bar from the browser storage on Opera browser.
 *
 * @returns The title of the currently active bookmarks bar.
 */
async function getCurrentBarTitleOpera(workspaceId?: string) {
    const id = workspaceId ?? (await getCurrentWorkspaceId());
    const currentBarsInfo = (await get<CurrentBarInfo[]>(CURRENT_BARS_INFO_KEY)) ?? ([] as CurrentBarInfo[]);

    const currentTitle = currentBarsInfo
        .filter((bar) => bar.workspaceId === id)
        .map((bar) => bar.currentBarTitle)
        .at(0);

    if (currentTitle === undefined) {
        const customBars = await getCustomBars();
        const finalCurrentTitle = customBars.at(0) === undefined ? DEFAULT_CURRENT_TITLE : customBars[0].title;

        currentBarsInfo.push({ currentBarTitle: finalCurrentTitle, workspaceId: id });
        await set(CURRENT_BARS_INFO_KEY, currentBarsInfo);
        return finalCurrentTitle;
    }
    return currentTitle;
}

/**
 * Update the title of the currently active bookmarks bar in the browser storage.
 *
 * @param currentBarTitle - The current bar title.
 */
export async function updateCurrentBarTitle(currentBarTitle: string) {
    if (isOperaBrowser()) {
        return updateCurrentBarTitleOpera(currentBarTitle);
    }
    await set(CURRENT_BAR_TITLE_KEY, currentBarTitle);
}

/**
 * Update the title of the currently active bookmarks bar in the browser storage on Opera browser.
 *
 * @param currentBarTitle - The current bar title.
 */
async function updateCurrentBarTitleOpera(currentBarTitle: string) {
    const workspaceId = await getCurrentWorkspaceId();
    const currentBarsInfo = await get<CurrentBarInfo[]>(CURRENT_BARS_INFO_KEY);
    if (currentBarsInfo === undefined) {
        return;
    }

    const index = currentBarsInfo.findIndex((info) => info.workspaceId === workspaceId);
    if (index === -1) {
        currentBarsInfo.push({ currentBarTitle, workspaceId });
    } else {
        currentBarsInfo[index].currentBarTitle = currentBarTitle;
    }
    await set(CURRENT_BARS_INFO_KEY, currentBarsInfo);
}

/**
 * Get the id of the previously selected workspace from browser storage.
 *
 * @returns The id.
 */
export async function getLastWorkspaceId() {
    const lastWorkspaceId = await get<string>(LAST_WORKSPACE_ID_KEY);
    return lastWorkspaceId ?? '0';
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
async function get<T>(key: string) {
    const { key: value }: { key?: T } = await chrome.storage.local.get(key);
    if (value === undefined) {
        const { key: syncedValue }: { key?: T } = await chrome.storage.sync.get(key);
        return syncedValue;
    }
    return value;
}

/**
 * Set an entry in the browser storage.
 * The entry will be set in both local
 * and synced storage.
 * @param key - The entry key.
 * @param value - The entry value.
 */
async function set<T>(key: string, value: T) {
    await chrome.storage.local.set({ key: value });
    await chrome.storage.sync.set({ key: value });
}
