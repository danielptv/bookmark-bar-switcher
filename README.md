# Bookmark Bar Switcher

Bookmark Bar Switcher is a Chrome extension which allows users to conveniently switch between bookmarks using the
extension popup or keyboard shortcuts.

![Bookmark Bar Switcher interface](https://user-images.githubusercontent.com/93288603/230776334-b1ea8670-0f11-4c13-b87c-4fdbe125ee14.png)

![Chrome Web Store](https://user-images.githubusercontent.com/93288603/230715576-77cafdcb-9f4e-465d-8c81-cfb305068946.png)


**The extension can be installed from the [Chrome Web Store](https://chrome.google.com/webstore/detail/bookmark-bar-switcher/ogcdabloogpipelcphkhajkaneclpnlk).**


## Inspiration

The development of this extension was inspired by the
original [Bookmark-Bar-Switcher](https://github.com/zoeesilcock/Bookmark-Bar-Switcher). Sadly, it does not work with the
current version of Chrome any longer. Therefore, I have developed a new app using Vue.js with TypeScript and Bootstrap
recreating and extending the functionality of the original.

## How to use

### Switch with mouse

All available bookmark bars will show up in the extension popup.
To switch bars, just click the bookmark bar you would
like to switch to.

### Switch with keyboard shortcuts

Alternatively, you can also switch using keyboard shortcuts:

* **CTRL + Arrow-Up/Down:** Switch to the next or previous bookmark bar.
* **CTRL + SHIFT + 1:** Switch to the first bookmark bar.
* **CTRL + SHIFT + 2:** Switch to the second bookmark bar.

Additional shortcuts are available. To assign them visit ***chrome://extensions/shortcuts***.

### Edit bookmarks and bookmark bars

You can add, rename or remove bookmark bars inside the folder "Bookmark Bars".
It is located in ***"Other bookmarks"***.
Changes made will immediately show up in the popup.

You can add, delete, move and rename your bookmarks as usual.
The extension will not interfere there.
The only restriction is that the names of bookmark bars have to be unique.

## How it works

The extension exchanges the bookmarks inside the current bookmark bar with the ones within a chosen folder in
***"Bookmark Bars"***.
The current bookmark bar will be backed up to a folder in "Bookmark Bars".
I suggest renaming your current
bookmark bar as it will be called ***"default"*** when you first install the extension.

## What the future holds

The extension is still in development, and I will try to add additional features like renaming and reordering bookmarks
inside the extension (rather than in the bookmark manager)
bit by bit.

Recently I have migrated the extension to Vue.js to be able to add new features easier in the future.

**The extension has now been released to
the [Chrome Web Store](https://chrome.google.com/webstore/detail/bookmark-bar-switcher/ogcdabloogpipelcphkhajkaneclpnlk).
Enjoy and feel free to contribute and leave feedback!**

