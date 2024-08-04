import { changeUsernameModal } from "@components/changeUsernameModal";
import { deleteAccountModal } from "@components/deleteAccountModal";
import { getCookie, queryElement } from "@util/client-util";
import { Signal, Effect } from "@util/signal";
import htmx from "htmx.org";

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


const updateSettings = new Effect(() => {
    const data: accountData = accountInfo.value;
    queryElement("#username").innerText = data.username;
    queryElement("#email").innerText = data.email;
});
const sendToHome = () => {
    htmx.ajax("get", "/", ".content");
    history.pushState(null, "", "/login")
};

document.querySelector("#changename")?.addEventListener("click", changeUsernameModal(fetchAccountInfo).showModal);
document.querySelector("#deleteAccount")?.addEventListener("click", deleteAccountModal(sendToHome).showModal);

const logout = queryElement("#logout");

logout.addEventListener("click", () => {
    htmx.ajax("get", "/logout", {
        target: ".content",
        headers: { "Authorization": `Bearer ${getCookie("jwt_token")}`}
    });
    history.pushState(null, "", "/")
})
