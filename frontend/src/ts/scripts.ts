import { getCookie } from "@util/client-util";
import { debounce } from "@util/util";
import htmx, { HtmxResponseInfo } from "htmx.org";

type htmxEvent = {
    detail: HtmxResponseInfo;
} & Event;

const scrollElement = document.querySelector('#game-cards');

document.addEventListener("DOMContentLoaded", function () {
    updateNav();
});
document.addEventListener("htmx:afterRequest", function (evt) {
    const htmxEvt = evt as htmxEvent;
    if (htmxEvt.detail.failed) {
        const statusCode = htmxEvt.detail.xhr.status;
        if (statusCode === 403 || statusCode === 401) {
            htmxEvt.preventDefault();
            htmx.ajax("get", "/login", ".content");
            history.pushState({}, "", "/login");
        }
    }
    updateNav();
});
document.addEventListener("htmx:beforeRequest", function (evt) {
    const htmxEvt = evt as htmxEvent;

    if (htmxEvt.detail.pathInfo.requestPath === "/settings") {
        if (getCookie("jwt_token")){
            htmxEvt.detail.xhr.setRequestHeader("Authorization", `Bearer ${getCookie("jwt_token")}`);
        }
    }
})

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
    const path = document.location.pathname.split("/")[1];
    const elemId = path ? path : "home";
    const selQuery = `.${elemId}-nav`;

    const currSelNavList = document.getElementsByClassName("nav-selected");
    const selNav = document.querySelector(selQuery)
        ? document.querySelector(selQuery)
        : document.querySelector(`.settings-nav`);

    if (!selNav) {
        throw new Error("No .settings-nav button");
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
