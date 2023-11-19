interface OperaWorkspaceEntry {
    workspaceId: string;
    workspaceName: string;
}

export interface OperaTab extends chrome.tabs.Tab, OperaWorkspaceEntry {}

export interface BookmarksBar {
    id: string;
    title: string;
}
export interface BookmarksBarOpera extends BookmarksBar {
    workspaceId: string;
}
