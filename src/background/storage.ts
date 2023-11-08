import { type SyncedWorkspaceEntry } from '~/background/classes';

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
    const { workspaces }: { workspaces?: SyncedWorkspaceEntry[] } = await chrome.storage.sync.get('workspaces');

    // Create the workspace list if it doesn't exist
    if (workspaces === undefined) {
        console.log('workspaces is undefined. Creating entry.');
        await chrome.storage.sync.set({ workspaces: [] });
        return [] as SyncedWorkspaceEntry[];
    }

    const workspaceArray = Object.values(workspaces);

    // Sort the workspaces by workspaceId
    return workspaceArray.sort((a, b) => {
        return Number.parseInt(a.workspaceId, 10) - Number.parseInt(b.workspaceId, 10);
    });
}

// add a workspace to the workspace list
export async function addWorkspace(workspace: SyncedWorkspaceEntry): Promise<SyncedWorkspaceEntry[]> {
    const workspaces = await getWorkspaceList();
    workspaces.push(workspace);
    await chrome.storage.sync.set({ workspaces });

    console.log('Added workspace', workspace);
    return workspaces;
}

// update a workspace in the workspace list
export async function updateWorkspace(workspace: SyncedWorkspaceEntry): Promise<SyncedWorkspaceEntry[]> {
    const workspaces = await getWorkspaceList();
    const workspaceIndex = workspaces.findIndex((w) => w.workspaceId === workspace.workspaceId);
    workspaces[workspaceIndex] = workspace;
    await chrome.storage.sync.set({ workspaces });

    console.log(`Updated workspace: ${workspaceIndex}`, workspaces);
    return workspaces;
}

// rename syncedBarTitle of a workspace in the workspace list by barTitle
export async function renameLinkedWorkspaceBar(syncedBarTitle: string, updatedTitle: string): Promise<void> {
    const workspaces = await getWorkspaceList();
    const workspaceIndex = workspaces.findIndex((w) => w.syncedBarTitle === syncedBarTitle);
    workspaces[workspaceIndex].syncedBarTitle = updatedTitle;
    await chrome.storage.sync.set({ workspaces });

    console.log(`Renamed workspace: ${workspaceIndex}`, workspaces);
}


// unlink a workspace from the workspace list by barTitle
export async function unlinkWorkspace(barTitle: string): Promise<SyncedWorkspaceEntry[]> {
    const workspaces = await getWorkspaceList();
    const workspaceIndex = workspaces.findIndex((w) => w.syncedBarTitle === barTitle);
    workspaces[workspaceIndex].syncedBarTitle = '';
    await chrome.storage.sync.set({ workspaces });

    console.log(`Unlinked workspace: ${workspaceIndex}`, workspaces);
    return workspaces;
}

// update the workspace list
export async function updateWorkspacesList(workspaces: SyncedWorkspaceEntry[]) {
    await chrome.storage.sync.set({ workspaces });

    console.log('Updated workspaces list', workspaces);
    return workspaces;
}
