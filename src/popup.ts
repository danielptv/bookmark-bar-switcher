import {debug} from "./loggingUtil";

/**
 * Function for populating the popup with the names of available bookmark bars.
 */
async function populatePopup() {
    debug("populatePopup()");
    const customBarsId = (await chrome.storage.sync.get("customBarsId"))["customBarsId"];
    const currentBarTitle = (await chrome.storage.sync.get("currentBarTitle"))["currentBarTitle"];
    const list = document.getElementById("bookmark_bars");

    const customBars = await chrome.bookmarks.getChildren(customBarsId);
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
 * Function for updating the frontend when two bars have been exchanged.
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
 * Function for updating the popup when bookmark bars have been exchanged using the shortcuts.
 */
async function updatePopup() {
    debug("updatePopup()");
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
    debug("updatePopup() successful");
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
    await updatePopup();
})


