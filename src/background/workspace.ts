import Tab = chrome.tabs.Tab;

export interface BookmarkTreeNode extends chrome.bookmarks.BookmarkTreeNode {}

export interface OperaWorkspaceEntry {
    workspaceId: string;
    workspaceName: string;
}

export interface OperaTab extends Tab, OperaWorkspaceEntry {}

export interface CurrentBarInfo {
    currentBarTitle: string;
    workspaceId: string;
}
