import {
    handleChange,
    handleMove,
    handleRemove,
    handleShortcut,
    handleWorkspaceSwitch,
} from '~/background/handlers.ts';
import { install } from '~/background/service.ts';
import { isOperaBrowser } from './util.ts';

chrome.runtime.onInstalled.addListener(install);
chrome.bookmarks.onChanged.addListener(handleChange);
chrome.bookmarks.onRemoved.addListener(handleRemove);
chrome.bookmarks.onMoved.addListener(handleMove);
chrome.commands.onCommand.addListener(handleShortcut);
if (isOperaBrowser()) {
    // An onActivated event is fired on every workspace switch
    chrome.tabs.onActivated.addListener(handleWorkspaceSwitch);
}
