import TabActiveInfo = chrome.tabs.TabActiveInfo;
import Tab = chrome.tabs.Tab;

export interface BookmarkTreeNode extends chrome.bookmarks.BookmarkTreeNode {}

export interface SyncedWorkspaceEntry extends OperaWorkspaceEntry {
    syncedBarTitle: string;
}

export interface OperaWorkspaceEntry {
    workspaceId: string;
    workspaceName: string;
}

export interface OperaTabActiveInfo extends TabActiveInfo, OperaWorkspaceEntry {}

export interface OperaTab extends Tab, OperaWorkspaceEntry {}
