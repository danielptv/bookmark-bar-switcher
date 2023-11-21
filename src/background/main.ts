import { handleChange, handleMove, handleRemove, handleShortcut, handleWorkspaceSwitch } from '~/background/handlers';
import { install } from '~/background/service';
import { isOperaBrowser } from './util';

chrome.runtime.onInstalled.addListener(install);
chrome.bookmarks.onChanged.addListener(handleChange);
chrome.bookmarks.onRemoved.addListener(handleRemove);
chrome.bookmarks.onMoved.addListener(handleMove);
chrome.commands.onCommand.addListener(handleShortcut);
if (isOperaBrowser()) {
    // An onActivated event is fired on every workspace switch
    chrome.tabs.onActivated.addListener(handleWorkspaceSwitch);
}
