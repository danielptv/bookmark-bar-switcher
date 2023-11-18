
<h1 align="center">Bookmark Bar Switcher</h1>

<p align="center">
A browser extension for conveniently switching between bookmark bars.
</p>

<p align="center">
  <a href="https://github.com/danielptv/bookmark-bar-switcher">
    <img src="https://user-images.githubusercontent.com/93288603/230776334-b1ea8670-0f11-4c13-b87c-4fdbe125ee14.png" alt="Bookmark Bar Switcher">
  </a>
</p>

<p align="left">
  <a href="https://chrome.google.com/webstore/detail/bookmark-bar-switcher/ogcdabloogpipelcphkhajkaneclpnlk">
    <img src="https://user-images.githubusercontent.com/93288603/230715576-77cafdcb-9f4e-465d-8c81-cfb305068946.png" alt="Chrome Web Store">
  </a>
</p>

## Inspiration

The development of this extension was inspired by the
original [Bookmark-Bar-Switcher](https://github.com/zoeesilcock/Bookmark-Bar-Switcher). Sadly, it does not work with the
current version of Chrome any longer. Therefore, I have developed a new app using Vue.js with TypeScript and Bootstrap
recreating and extending the functionality of the original.

## Supported Browsers

Currently, this extension supports Chromium browsers only.

| Browser | Support Level                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------ |
| **Chrome**  | *Officially Supported* (with automated tests)                                                    |
| **Opera**   | *Unofficially Supported* as a Chrome-compatible target (but not explicitly tested in automation) |
| **Edge**    | *Unofficially Supported* as a Chrome-compatible target (but not explicitly tested in automation) |

## How to Use

### Switch between Bookmark Bars

#### Mouse

All available bookmark bars will show up in the extension popup.
To switch between them, just click the one you would
like to switch to.

#### Keyboard Shortcuts

Alternatively, you can also switch using keyboard shortcuts. The default bindings are:

| Shortcut               | Command                             |
| ---------------------- | ----------------------------------- |
| `CTRL` + `UpArrow`     | Switch to the next bookmark bar     |
| `CTRL` + `DownArrow`   | Switch to the previous bookmark bar |
| `CTRL` + `Shift` + `1` | Switch to the first bookmark bar    |
| `CTRL` + `Shift` + `2` | Switch to the second bookmark bar   |

Additional shortcuts are available. To assign them or redefine existing shortcuts visit ***chrome://extensions/shortcuts***.

### Edit Bookmark Bars

You can add, rename, reorder and remove bookmark bars from within the extension:

* **Add:** Type the name of your new bar into the input field at the bottom and confirm with `Enter` or by clicking the ***PLUS***-button.
* **Edit:** Either use the ***EDIT***-button next to the bar you want to modify or double-click it. Type the new name and
  confirm with `Enter` or by clicking the ***SAVE***-button.
* **Reorder:** Drag the bookmark bar to its desired position with the mouse and drop it.
* **Remove:** Enter the ***EDIT*** mode and click the ***DELETE*** button.

## How it Works

The extension exchanges the bookmarks inside the current bookmark bar with the ones within a chosen folder in the
*"Bookmark Bars"* directory.
The current bookmark bar will be backed up to a folder in *"Bookmark Bars"*.
The current
bookmark bar will be called ***"My first bookmark bar 🚀"*** when you first install the extension.
