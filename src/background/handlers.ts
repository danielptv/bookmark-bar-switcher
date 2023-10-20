import { exchange, setupCurrentBar } from '~/background/service';
import { findFolder, getCustomDirectoryId, handleDuplicateName, isOperaBrowser } from '~/background/util';
import { getCurrentBarTitle, updateCurrentBarTitle, updateWorkspacesList } from '~/background/storage';
import TabActiveInfo = chrome.tabs.TabActiveInfo;
import { OperaTab, OperaTabActiveInfo } from '~/background/classes';

export const handleUpdate = async (id: string, info: { title: string; url?: string }) => {
    if (info.url !== undefined) {
        return;
    }
    const customDirectoryId = await getCustomDirectoryId();
    const currentBarTitle = await getCurrentBarTitle();
    if (id === customDirectoryId) {
        await setupCurrentBar();
        return;
    }

    chrome.bookmarks.onChanged.removeListener(handleUpdate);
    const title = await handleDuplicateName(customDirectoryId, info.title);
    await chrome.bookmarks.update(id, { title });
    chrome.bookmarks.onChanged.addListener(handleUpdate);

    const result = await findFolder(customDirectoryId, currentBarTitle);
    if (result.length === 0) {
        await updateCurrentBarTitle(title);
    }
};

export const handleCreate = async (id: string, bookmark: { title: string; url?: string }) => {
    if (bookmark.url !== undefined) {
        return;
    }
    const customDirectoryId = await getCustomDirectoryId();
    chrome.bookmarks.onChanged.removeListener(handleUpdate);
    const title = await handleDuplicateName(customDirectoryId, bookmark.title);
    await chrome.bookmarks.update(id, { title });
    chrome.bookmarks.onChanged.addListener(handleUpdate);
};

export const handleMove = async (id: string) => {
    const bookmark = await chrome.bookmarks.get(id);
    if (bookmark[0].url !== undefined) {
        return;
    }
    const customDirectoryId = await getCustomDirectoryId();
    if (id === customDirectoryId) {
        await setupCurrentBar();
        return;
    }
    chrome.bookmarks.onChanged.removeListener(handleUpdate);
    const title = await handleDuplicateName(customDirectoryId, bookmark[0].title);
    await chrome.bookmarks.update(id, { title });
    chrome.bookmarks.onChanged.addListener(handleUpdate);
};

export const handleDelete = async (id: any, removeInfo: { node: { title: string; url?: string } }) => {
    if (removeInfo.node.url !== undefined) {
        return;
    }
    const customDirectoryId = await getCustomDirectoryId();
    if (id === customDirectoryId) {
        await setupCurrentBar();
        return;
    }

    const currentBarTitle = await getCurrentBarTitle();
    if (removeInfo.node.title === currentBarTitle) {
        await chrome.bookmarks.create({
            parentId: customDirectoryId,
            title: currentBarTitle,
        });
    }
};

const SHORTCUT_DELAY = 100;
export const handleShortcut = debounce(async (command: string) => {
    const getNext = command === 'next-bar';
    const customDirectoryId = await getCustomDirectoryId();
    const currentBarTitle = await getCurrentBarTitle();
    const bookmarks = await chrome.bookmarks.getChildren(customDirectoryId);
    const bars = bookmarks.filter((bar) => !bar.url);
    if (bars.length === 0) {
        return;
    }

    if (/^switch-to-[1-9]$/u.test(command)) {
        const index = Number(command.split('-')[2]) - 1;
        const title = bars[index] ? bars[index].title : bars[0].title;
        await exchange(title);
        return;
    }

    let title;
    const index = bars.map((b) => b.title).indexOf(currentBarTitle);
    if (getNext) {
        title = bars[index + 1] ? bars[index + 1].title : bars[0].title;
    } else {
        title = bars[index - 1] ? bars[index - 1].title : bars.at(-1)?.title;
    }
    await exchange(title ?? '');
}, SHORTCUT_DELAY);

export const handleWorkspaceChanged = async (tab: OperaTabActiveInfo | TabActiveInfo) => {
    if (!isOperaBrowser()) return;

    const currTab = (await chrome.tabs.get(tab.tabId)) as OperaTab;
    const workspaceEntry = {
        workspaceId: currTab.workspaceId,
        workspaceName: currTab.workspaceName,
    };
    console.log(workspaceEntry);

    // update the workspace list
    const workspaces = await updateWorkspacesList({ ...workspaceEntry, syncedBarTitle: '' });
    if (workspaces === undefined) return;

    // get the current workspace
    const currWorkspace = workspaces.find((w) => w.workspaceId === workspaceEntry.workspaceId);
    if (currWorkspace === undefined || currWorkspace.syncedBarTitle.length <= 0) return;

    // exchange the current bar title with the synced bar title
    const currentBarTitle = await getCurrentBarTitle();
    if (currWorkspace.syncedBarTitle !== currentBarTitle) {
        await exchange(currWorkspace.syncedBarTitle);
    }
};

function debounce(func: { (command: string): Promise<void> }, delay: number) {
    let timerId: NodeJS.Timeout | undefined;
    return function (...args: [string]) {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(async () => {
            await func(...args);
            timerId = undefined;
        }, delay);
    };
}
