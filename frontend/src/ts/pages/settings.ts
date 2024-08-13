import { changeUsernameModal } from "@components/changeUsernameModal";
import { deleteAccountModal } from "@components/deleteAccountModal";
import { getCookie, queryElement } from "@util/client-util";
import { Signal, Effect } from "@util/signal";
import htmx from "htmx.org";
import { ac } from "vitest/dist/chunks/reporters.C_zwCd4j.js";

const jwt = getCookie("jwt_token");
const infoRequest = new Request("accounts/getData", {
    headers: { Authorization: `Bearer ${jwt}`}
});

type accountData = {
    username: string;
    email: string;
    accountCreated: string;
}

const accountInfo = new Signal<accountData>({} as accountData);

const fetchAccountInfo = () => {
    fetch(infoRequest).then((res) => {
        if (res.status !== 200) {
            htmx.ajax("get", "/login", ".content");
            history.pushState(null, "", "/login")
        }
        const responseBody = res.json();
        responseBody.then(body => {
            accountInfo.value = body;
        })
    });
}

fetchAccountInfo();

document.addEventListener("htmx:afterRequest", () => {
    if (document.querySelector(".account-info")) fetchAccountInfo();
});
const sendToHome = () => {
    htmx.ajax("get", "/", ".content");
    history.pushState(null, "", "/login")
};
const modal_DeleteAccount = deleteAccountModal(sendToHome);

document.addEventListener("click", (evt) => {
    let targetElem: HTMLElement = <HTMLElement> evt.target;
    if (!targetElem) {
        return;
    }

    switch (targetElem.id) {
        case "logout":
            htmx.ajax("put", "/logout", {
            target: ".content",
            headers: { "Authorization": `Bearer ${getCookie("jwt_token")}`}
        });
        history.pushState(null, "", "/")
        break;
        case "cancel-changes": 
            accountInfo.notify();
        break;
        case "deleteAccount":
            modal_DeleteAccount.showModal();
        break;
    }
})

const updateSettings = new Effect(() => {
    const data: accountData = accountInfo.value;
    (<HTMLInputElement> queryElement("#username")).value = data.username;
    (<HTMLInputElement> queryElement("#email")).value = data.email;
});

