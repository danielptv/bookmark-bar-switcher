import { handleCreate, handleDelete, handleMove, handleShortcut, handleUpdate } from '~/background/handlers';
import { setupCurrentBar } from '~/background/service';

chrome.runtime.onInstalled.addListener(setupCurrentBar);
chrome.bookmarks.onChanged.addListener(handleUpdate);
chrome.bookmarks.onRemoved.addListener(handleDelete);
chrome.bookmarks.onCreated.addListener(handleCreate);
chrome.bookmarks.onMoved.addListener(handleMove);
chrome.commands.onCommand.addListener(handleShortcut);
