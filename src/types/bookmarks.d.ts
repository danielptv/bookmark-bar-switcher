declare module 'bookmarks' {
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

    export interface BookmarksBarPopup extends BookmarksBar {
        isActive: boolean;
        isEdited: boolean;
    }

    export interface RemoveCandidate extends BookmarksBarPopup {
        index: number;
    }
}
