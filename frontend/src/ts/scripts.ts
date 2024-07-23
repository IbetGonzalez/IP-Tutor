import { debounce } from './util/util'
import htmx, { HtmxResponseInfo } from 'htmx.org';

type htmxEvent = {
    detail: HtmxResponseInfo;
} &Event

document.addEventListener("DOMContentLoaded", function() { updateNav() });
document.addEventListener("htmx:afterRequest", function(evt) { 
    const htmxEvt = evt as htmxEvent;
    if (htmxEvt.detail.failed){
        const statusCode = htmxEvt.detail.xhr.status;
        if (statusCode === 403 || statusCode === 401) {
            htmxEvt.preventDefault();
            htmx.ajax("get", "/login", ".content");
            history.pushState({}, "", "/login");
        }
    }
    updateNav() 
});
let hideBtn: HTMLButtonElement | null = document.querySelector("#hide-button");
if (hideBtn) {
    hideBtn.addEventListener("click", MinimizeNav);
} else {
    console.warn("No #hide-button element");
}


function MinimizeNav() {
    let nav = document.getElementById("nav-bar");
    if (!nav) {
        throw new Error("No nav bar (#nav-bar");
    }

    let Toggle = debounce(() => {
        nav.classList.toggle("minimized");
    }, 50);
    Toggle();
}

function updateNav() {
    let path = document.location.pathname.split("/")[1];

    let currSelNavList = document.getElementsByClassName("nav-selected");
    
    let selNav = path ? document.getElementById(path) : document.getElementById("home");
    if (!selNav) {
        throw new Error("No #home nav button");
    }

    for (let i = 0; i < currSelNavList.length; i++) {
        const currSel = currSelNavList.item(i);
        if (!currSel) {
            break;
        }
        currSel.classList.remove("nav-selected");
    }
    selNav.classList.add("nav-selected");
}
