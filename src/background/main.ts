import { handleDelete, handleMove, handleShortcut, handleUpdate, handleWorkspaceSwitch } from '~/background/handlers';
import { setupCurrentBar } from '~/background/service';

chrome.runtime.onInstalled.addListener(setupCurrentBar);
chrome.bookmarks.onChanged.addListener(handleUpdate);
chrome.bookmarks.onRemoved.addListener(handleDelete);
chrome.bookmarks.onMoved.addListener(handleMove);
chrome.commands.onCommand.addListener(handleShortcut);
chrome.tabs.onActivated.addListener(handleWorkspaceSwitch);
