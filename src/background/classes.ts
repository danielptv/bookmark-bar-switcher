import TabActiveInfo = chrome.tabs.TabActiveInfo;
import Tab = chrome.tabs.Tab;

export interface SyncedWorkspaceEntry extends OperaWorkspaceEntry {
    syncedBarTitle: string;
}

export interface OperaWorkspaceEntry {
    workspaceId: string;
    workspaceName: string;
}

export type OperaTabActiveInfo = TabActiveInfo & OperaWorkspaceEntry;
export type OperaTab = Tab & OperaWorkspaceEntry;
