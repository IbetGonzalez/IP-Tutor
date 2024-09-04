import { getCookie, queryElement } from "@util/client-util";
import { debounce } from "@util/util";
import htmx, { HtmxResponseInfo } from "htmx.org";

type htmxEvent = {
    detail: HtmxResponseInfo;
} & Event;

document.addEventListener("DOMContentLoaded", function () {
    updateNav();
    updateHome();
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
    updateHome();
});

document.addEventListener("htmx:beforeRequest", function (evt) {
    const htmxEvt = evt as htmxEvent;
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

function updateHome() {
    if (getCookie("jwt_token")) {
        const homeLoginBtn: HTMLButtonElement | null = document.querySelector("#login-btn");
        if (homeLoginBtn) {
            homeLoginBtn.innerText = "Settings";
            homeLoginBtn.setAttribute("hx-get", "/settings");
        }
    }
}
function updateNav() {
    if (!getCookie("jwt_token")) {
        queryElement(".settings-nav").innerText = "Login";
    } else { 
        queryElement(".settings-nav").innerText = "Settings";
    }
    const path = document.location.pathname.split("/")[1];
    const elemId = path ? path : "home";
    const selQuery = `.${elemId}-nav`;

    const currSelNavList = document.querySelectorAll(".nav-selected");

    currSelNavList.forEach(elem => elem.classList.remove("nav-selected"));

    const selNav = document.querySelectorAll(selQuery).length > 0
        ? document.querySelectorAll(selQuery)
        : document.querySelectorAll(`.settings-nav`);

    if (!selNav) {
        throw new Error("No .settings-nav button");
    }

    selNav.forEach((elem) => elem.classList.add("nav-selected"));
}
