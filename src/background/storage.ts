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

// update the workspace list if the workspaceId is not in the list else add it to the list
export async function updateWorkspacesList(
    workspace: SyncedWorkspaceEntry,
): Promise<SyncedWorkspaceEntry[] | undefined> {
    const { workspaces } = await chrome.storage.sync.get('workspaces');

    // create the workspace list if it doesn't exist
    if (workspaces === undefined) {
        console.log('workspaces is undefined');
        await chrome.storage.sync.set({ workspaces: [workspace] });
        return;
    }

    // add the workspace if the workspaceId is not in the list
    const workspaceIds = workspaces.map((w: OperaWorkspaceEntry) => w.workspaceId);
    if (!workspaceIds.includes(workspace.workspaceId)) {
        console.log('workspaceIds does not include workspaceId');
        workspaces.push(workspace);
        await chrome.storage.sync.set({ workspaces });
        return;
    }

    // update the workspace if the name has changed and only sync to storage if the workspaceName has changed
    const workspaceIndex = workspaceIds.indexOf(workspace.workspaceId);
    if (workspaces[workspaceIndex].workspaceName !== workspace.workspaceName) {
        console.log('workspaceName has changed');
        workspaces[workspaceIndex].workspaceName = workspace.workspaceName;
        await chrome.storage.sync.set({ workspaces });
        return;
    }

    console.log(await chrome.storage.sync.get('workspaces'));
    return workspaces;
}
