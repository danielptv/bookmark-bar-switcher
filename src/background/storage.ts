import { type CurrentBarInfo, type OperaTab } from '~/background/workspace';
import { getCustomBars, isOperaBrowser } from './util';

const DEFAULT_CURRENT_TITLE = 'My first bookmark bar 🚀';

/**
 * Get the title of the currently active bookmarks bar from the browser storage.
 *
 * @returns The title of the currently active bookmarks bar.
 */
export async function getCurrentBarTitle() {
    if (isOperaBrowser()) {
        return getCurrentBarTitleOpera();
    }
    const { currentBarTitle: currentBarTitleLocal }: { currentBarTitle?: string } = await chrome.storage.local.get(
        'currentBarTitle',
    );
    if (currentBarTitleLocal !== undefined) {
        return currentBarTitleLocal;
    }
    const { currentBarTitle }: { currentBarTitle?: string } = await chrome.storage.sync.get('currentBarTitle');
    if (currentBarTitle !== undefined) {
        await chrome.storage.local.set({ currentBarTitle });
        return currentBarTitle;
    }
    await chrome.storage.local.set({ currentBarTitle: DEFAULT_CURRENT_TITLE });
    await chrome.storage.sync.set({ currentBarTitle: DEFAULT_CURRENT_TITLE });
    return DEFAULT_CURRENT_TITLE;
}

/**
 * Get the title of the currently active bookmarks bar from the browser storage on Opera browser.
 *
 * @returns The title of the currently active bookmarks bar.
 */
async function getCurrentBarTitleOpera() {
    const workspaceId = await getCurrentWorkspaceId();
    let { currentBarsInfo }: { currentBarsInfo?: CurrentBarInfo[] } = await chrome.storage.local.get('currentBarsInfo');
    if (currentBarsInfo === undefined) {
        const { currentBarsInfo: currentBarsInfoSynced }: { currentBarsInfo?: CurrentBarInfo[] } =
            await chrome.storage.sync.get('currentBarsInfo');
        currentBarsInfo = currentBarsInfoSynced === undefined ? ([] as CurrentBarInfo[]) : currentBarsInfoSynced;
        await chrome.storage.local.set({ currentBarsInfo });
    }

    const currentTitle = currentBarsInfo
        .filter((bar) => bar.workspaceId === workspaceId)
        .map((bar) => bar.currentBarTitle)
        .at(0);

    if (currentTitle === undefined) {
        const customBars = await getCustomBars();
        const finalCurrentTitle = customBars.at(0) === undefined ? DEFAULT_CURRENT_TITLE : customBars[0].title;

        currentBarsInfo.push({ currentBarTitle: finalCurrentTitle, workspaceId });
        await chrome.storage.local.set({ currentBarsInfo });
        await chrome.storage.sync.set({ currentBarsInfo });
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
    await chrome.storage.local.set({ currentBarTitle });
    await chrome.storage.sync.set({ currentBarTitle });
}

/**
 * Update the title of the currently active bookmarks bar in the browser storage on Opera browser.
 *
 * @param currentBarTitle - The current bar title.
 */
async function updateCurrentBarTitleOpera(currentBarTitle: string) {
    const workspaceId = await getCurrentWorkspaceId();
    const { currentBarsInfo }: { currentBarsInfo?: CurrentBarInfo[] } = await chrome.storage.local.get(
        'currentBarsInfo',
    );
    if (currentBarsInfo === undefined) {
        return;
    }

    const index = currentBarsInfo.findIndex((info) => info.workspaceId === workspaceId);
    if (index === -1) {
        currentBarsInfo.push({ currentBarTitle, workspaceId });
    } else {
        currentBarsInfo[index].currentBarTitle = currentBarTitle;
    }
    await chrome.storage.local.set({ currentBarsInfo });
    await chrome.storage.sync.set({ currentBarsInfo });
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
