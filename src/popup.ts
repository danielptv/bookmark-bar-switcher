/**
 * @licence Copyright (C) 2022 - present Daniel Purtov
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @file This is the frontend section of the Bookmark Bar Switcher
 * controlling the popup you can see when clicking the extension.
 *
 * @author Daniel Purtov
 */

import {debug} from "./loggingUtil";

/**
 * Populate the popup with the names of available bookmark bars.
 */
async function populatePopup() {
    debug("populatePopup()");
    const customBarsId = (await chrome.storage.sync.get("customBarsId"))["customBarsId"];
    const currentBarTitle = (await chrome.storage.sync.get("currentBarTitle"))["currentBarTitle"];
    const list = document.getElementById("bookmark_bars");

    const customBars = (await chrome.bookmarks.getChildren(customBarsId))
        .filter(bar => !bar.url);
    let containsCurrentBar = false;
    customBars.forEach(item => {
        const wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        const btn = document.createElement("button");
        btn.className = "bar_btn";
        btn.innerHTML = item.title;
        if (item.title === currentBarTitle) {
            wrapper.id = "current_bar";
            containsCurrentBar = true;
        }
        wrapper.appendChild(btn)
        list.appendChild(wrapper);
    });
    if (!containsCurrentBar) {
        const div = document.createElement("div");
        div.className = "wrapper";
        const currentBarBtn = document.createElement("button");
        currentBarBtn.innerHTML = currentBarTitle;
        currentBarBtn.id = "current_bar";
        currentBarBtn.className = "bar_btn";
        div.appendChild(currentBarBtn);
        list.insertBefore(div, list.children[0]);
    }
    debug("populatePopup() successful");
}

/**
 * Update the popup when two bookmark bars have been exchanged.
 *
 * @param target Button of the targeted bookmark bar.
 */
async function handleBarExchange(target: HTMLButtonElement) {
    debug("handleBarExchange():" + target);

    const list = document.getElementById("bookmark_bars");
    await chrome.runtime.sendMessage({exchangeBars: target.innerHTML});
    for (const child of list.children) {
        if (child instanceof HTMLDivElement && child.id === "current_bar") {
            child.removeAttribute("id");
        }
    }
    target.id = "current_bar";
    debug("handleBarExchange() successful");
}

/**
 * Update the popup when bookmark bars have been exchanged using the shortcuts.
 */
async function handleShortcut() {
    debug("handleShortcut()");
    const currentBarTitle = (await chrome.storage.sync.get("currentBarTitle"))["currentBarTitle"];
    const list = document.getElementById("bookmark_bars");

    for (const div of list.children) {
        if (div as HTMLDivElement && div.children[0] as HTMLButtonElement) {
            if (div.children[0].innerHTML === currentBarTitle) {
                div.id = "current_bar";
                debug("buttonTitle: {}", div.children[0].innerHTML);
            } else if (div.id === "current_bar") {
                div.removeAttribute("id");
            }
        }
    }
    debug("handleShortcut() successful");
}

document.addEventListener('DOMContentLoaded', async () => {
    await populatePopup();
    document.getElementById("bookmark_bars").addEventListener("click", async function (e) {


        const target = e.target as HTMLButtonElement;
        if (target && target.parentElement.id !== "current_bar") {
            debug("click");
            await handleBarExchange(target);
        }
    });

});
chrome.storage.onChanged.addListener(async () => {
    await handleShortcut();
})


