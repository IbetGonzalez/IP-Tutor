import { deleteAccountModal } from "@components/deleteAccountModal";
import { getCookie, queryElement } from "@util/client-util";
import { Signal, Effect } from "@util/signal";
import { AlertColors, createAlert } from "@util/util";
import htmx from "htmx.org";

type accountData = {
    username: string;
    email: string;
    accountCreated: string;
}
class ChangeSettings extends HTMLElement {
    private accountInfo: Signal<accountData>;
    private updateSettings: Effect;
    private settingsButtons: HTMLButtonElement[];
    private modal_DeleteAccount;

    constructor() {
        super();
        this.accountInfo = new Signal<accountData>({} as accountData)

        this.settingsButtons = Array.from(document.querySelectorAll(".button"));
        this.settingsButtons.forEach((btnElem) => {
            btnElem.addEventListener("click", this.handlerBtnClick.bind(this));
        });

        this.updateSettings = new Effect(() => {
            const data: accountData = this.accountInfo.value;
            (<HTMLInputElement> queryElement("#username")).value = data.username;
            (<HTMLInputElement> queryElement("#email")).value = data.email;
        });

        this.modal_DeleteAccount = deleteAccountModal(this.sendHome);
    }
    connectedCallback() {
        this.fetchAccountInfo();
    }

    handlerBtnClick(e: Event) {
        const btnElem: HTMLButtonElement | null = e.target as HTMLButtonElement;
        if (!btnElem) {
            return;
        }
        const action = btnElem.getAttribute("action");
        console.log(action);
        switch (action) {
            case "delete-account":
                this.modal_DeleteAccount.showModal();
            break;
            case "logout":
                const jwt = getCookie("jwt_token");
                const logoutRequest = new Request("/accounts/logout", {
                    method: "put",
                    headers: { Authorization: `Bearer ${jwt}` }
                });
                fetch(logoutRequest).then((res) => {
                    console.log(res.status);
                    if (res.status === 200) {
                        createAlert("Successfuly logged out", 5000, AlertColors.SECONDARY);
                        this.sendHome();
                    } else {
                        createAlert("Something went wrong", 5000, AlertColors.WARNING);
                    }
                });
            break;
            default: 
                return;
        }
    }

    sendHome() {
        htmx.ajax("get", "/", ".content");
        history.pushState(null, "", "/")
    }

    fetchAccountInfo() {
        const jwt = getCookie("jwt_token");
        const infoRequest = new Request("accounts/getData", {
            headers: { Authorization: `Bearer ${jwt}`}
        });
        
        fetch(infoRequest).then((res) => {
            if (res.status !== 200) {
                htmx.ajax("get", "/login", ".content");
                history.pushState(null, "", "/login")
            }
            const responseBody = res.json();
            responseBody.then(body => {
                this.accountInfo.value = body;
            })
        });
    }

}
window.customElements.define("settings-display", ChangeSettings);
