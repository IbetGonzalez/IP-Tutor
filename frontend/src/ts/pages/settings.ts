import { getCookie, queryElement } from "@util/client-util";
import { Signal, Effect, createEffect } from "@util/signal";
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

const toggleNameInput = () => {
    // TODO: CREATE A COMPONENT MODAL DIALOG 
    return () => {
        alert("Not yet implemented");
    };
}
document.querySelector("#changename")?.addEventListener("click", toggleNameInput());


const updateSettings = new Effect(() => {
    const data: accountData = accountInfo.value;
    queryElement("#username").innerText = data.username;
    queryElement("#email").innerText = data.email;
});


const logout = queryElement("#logout");

logout.addEventListener("click", () => {
    document.cookie = "jwt_token=; Max-Age=-9999999;";
    window.location.reload();
})
