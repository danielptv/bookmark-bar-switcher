# Bookmark Bar Switcher

Bookmark Bar Switcher is a Chrome extension which allows users to conveniently switch between bookmarks using the
extension popup or keyboard shortcuts.

<p align="center">
    <img src="media/extension.png" alt="Bookmark Bar Switcher interface">
</p>

## Inspiration

The development of this extension was inspired by the
original [Bookmark-Bar-Switcher](https://github.com/zoeesilcock/Bookmark-Bar-Switcher). Sadly, it does not work with the
current version of Chrome any longer. Therefore, I have developed a new app using TypeScript as well as a number of MW3
exclusive features to recreate and extend the basic functionality of the original.

## Usage

All available bookmark bars will show up in the extension popup. To switch bars just click the bookmark bar you would like to switch to. Alternatively, you can also switch using keyboard shortcuts:
* CTRL + Arrow-Up/Down: Switch to the next or previous bookmark bar.
* CTRL + SHIFT + 1: Switch to the first bookmark bar.
* CTRL + SHIFT + 2: Switch to the second bookmark bar.

Additional shortcuts are available. To assign them visit [Chrome-Extensions-Shortcuts](chrome://extensions/shortcuts).

You can add, rename or remove bookmark bars inside the folder "Bookmark Bars". It is located within "Other bookmarks". Changes made will immediately show up in the popup.

## How it works

The extension exchanges the bookmarks inside the current bookmark bar with the ones within a chosen folder in "Bookmark Bars". The current bookmark bar will be backed up to a folder in "Bookmark Bars".  I suggest renaming your current bookmark bar as it will be called "default" when you first install the extension.

## What the future holds

The extension is still in development and I will try to add additional features like renaming and reordering bookmarks inside the extension (rather than in the bookmark manager)
bit by bit. The extension will be released to the Chrome Web Store once all basic functionality has been
implemented.

For now, you can use the extension by enabling developer mode and loading the extension manually. Feel free to feed back and contribute!
Enjoy!
