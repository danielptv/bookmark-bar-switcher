import { handleDelete, handleMove, handleShortcut, handleUpdate, handleWorkspaceSwitch } from '~/background/handlers';
import { isOperaBrowser } from './util';
import { setupCurrentBar } from '~/background/service';

chrome.runtime.onInstalled.addListener(setupCurrentBar);
chrome.bookmarks.onChanged.addListener(handleUpdate);
chrome.bookmarks.onRemoved.addListener(handleDelete);
chrome.bookmarks.onMoved.addListener(handleMove);
chrome.commands.onCommand.addListener(handleShortcut);
if (isOperaBrowser()) {
    // An onActivated event is fired on every workspace switch
    chrome.tabs.onActivated.addListener(handleWorkspaceSwitch);
}
