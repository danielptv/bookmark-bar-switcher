import { OperaWorkspaceEntry, SyncedWorkspaceEntry } from '~/background/classes';

const DEFAULT_CURRENT_TITLE = 'My first bookmark bar 🚀';

export async function getCurrentBarTitle() {
    const { currentBarTitleLocal } = await chrome.storage.local.get('currentBarTitle');
    if (currentBarTitleLocal !== undefined && typeof currentBarTitleLocal === 'string') {
        return currentBarTitleLocal;
    }
    const { currentBarTitle } = await chrome.storage.sync.get('currentBarTitle');
    if (currentBarTitle !== undefined && typeof currentBarTitle === 'string') {
        await chrome.storage.local.set({ currentBarTitle });
        return currentBarTitle;
    }
    await chrome.storage.local.set({ currentBarTitle: DEFAULT_CURRENT_TITLE });
    await chrome.storage.sync.set({ currentBarTitle: DEFAULT_CURRENT_TITLE });
    return DEFAULT_CURRENT_TITLE;
}

export async function updateCurrentBarTitle(currentBarTitle: string) {
    await chrome.storage.local.set({ currentBarTitle });
    await chrome.storage.sync.set({ currentBarTitle });
}

export async function getWorkspaceList(): Promise<SyncedWorkspaceEntry[]> {
    const { workspaces } = await chrome.storage.sync.get('workspaces');
    // create the workspace list if it doesn't exist
    if (workspaces === undefined) {
        console.log('workspaces is undefined. creating entry');
        await chrome.storage.sync.set({ workspaces: [] });
        return workspaces;
    }
    return workspaces;
}

// add a workspace to the workspace list
export async function addWorkspace(workspace: SyncedWorkspaceEntry): Promise<SyncedWorkspaceEntry[]> {
    const workspaces = await getWorkspaceList();
    workspaces.push(workspace);
    await chrome.storage.sync.set({ workspaces });
    return workspaces;
}

// update the workspace list
export async function updateWorkspacesList(workspaces: SyncedWorkspaceEntry[]) {
    await chrome.storage.sync.set({ workspaces });
}
