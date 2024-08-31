import { createEffect } from "@util/signal";
import { createState, ErrMsg, Form, FormInput, IndicatorStates, InputStates, MarkIndicator } from "./form";
import { getCookie, queryElement } from "@util/client-util";
import { AlertColors, createAlert } from "@util/util";
import htmx from "htmx.org";

const template: HTMLElement = document.createElement("div");
template.innerHTML = `
<style>
:host {
    position: absolute;
    display: flex;
    justify-content: center;
    background: #00000080;
    z-index: 1000;
    margin: 0;
    width: 100%;
    height: 100%;
}
.modal {
    position: relative;
    width: min(416px, 95svw);
    height: fit-content;
    margin-top: 25svh;
    box-sizing: border-box;
    color: var(--text);
    border-radius: 10px;
    background-color: var(--background-lite);
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.8);
    overflow: hidden;
}

.modal .top-gradient {
    position: absolute;
    width: 150%;
    height: 66px;
    box-shadow: -4px -4px 20px inset rgba(0, 0, 0, 0.4);
    background: linear-gradient(to right, var(--secondary), var(--primary));
}
.modal .card-content {
    display: flex;
    flex-direction: column;
    color: var(--text);
    padding: 1rem;
    padding-inline: 5%;
}

.form-input {
    display: flex;
    position: relative;
    padding: 7px 1rem;
    flex-wrap: wrap;
}
.form-input .text-input {
    flex-basis: 100%;
    padding-bottom: 6px;
    font-family: inherit;
    width: 100%;
    border: 0;
    border-bottom: 2px solid var(--text);
    outline: 0;
    font-size: 1.3rem;
    color: var(--text);
    background: transparent;
    transition: border-color 0.2s;

    &::placeholder {
        color: transparent;
    }
    &:placeholder-shown ~ .text-input-label {
        font-size: 1.3rem;
        cursor: text;
        top: 12px;
    }
}
.modal .header {
    color: var(--text);
    position: relative;
    margin-top: 74px;
    padding-inline: max(3rem, 6%);
    font-size: 28px;
    font-weight: 600;
}
.modal .buttons {
    display: flex;
    margin-top: 1rem;
    gap: 1rem;
}

.modal .button {
    display: flex;
    border: none;
    background-color: var(--info);
    color: var(--background);
    position: relative;
    margin: auto;
    justify-content: center;
    align-items: center;
    width: 8rem;
    height: 3.5rem;
    font-family: inherit;
    font-size: 1.125rem;
    font-weight: 600;
    &:hover {
        cursor: pointer;
    }
    &:disabled {
        cursor: not-allowed;
        background-color: #515151 !important;
    }
}

.form-input .err-message {
    color: var(--danger);
    font-size: 0.75rem;
    transition: height 100ms ease-out;
}
.indicator {
    position: absolute;
    right: 0;
    height: 30px;
}
.indicator .cross {
    opacity: 0;
    stroke: #ff0000;
    stroke-width: 6;
    transition: all 1s;
}

.indicator #tick {
    opacity: 0;
    stroke: var(--gradient2);
    stroke-width: 6;
    transition: all 1s;
}

.indicator #circle {
    stroke: var(--gradient2);
    stroke-width: 6;
    transform-origin: 50px 50px 0;
}

.form-input .text-input-label {
    position: absolute;
    pointer-events: none;
    top: -12px;
    display: block;
    transition: 0.2s;
    font-size: 1rem;
    color: var(--text);
}
.text-input:focus ~ .text-input-label {
    position: absolute;
    top: -16px !important;
    display: block;
    transition: 0.2s;
    color: var(--success);
    font-size: 1rem;
    font-weight: 700;
}
.bg-danger {
    background-color: var(--danger) !important;
    color: var(--text) !important;
}
</style>

<div class="top-gradient"></div>
<div class="header">Are you sure?</div>

<div class="card-content">
    <form id="delete-account-form">
        <div id="delete-password-wrapper" class="form-input" style="place-self: center;grid-column: 1 / -1;">
            <input
                class="text-input"
                id="password-field"
                name="password"
                type="password"
                placeholder="Password"
                style="width: 30rem"
            >
            <label class="text-input-label" for="#password-field">Password</label>
            <div class="indicator">
                <svg
                    id="check"
                    style="width: 30px; height: 30px"
                    class="hidden"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 100 100"
                    xml:space="preserve"
                >
                    <circle id="circle" cx="50" cy="50" r="46" fill="transparent" />
                    <polyline id="tick" points="25,55 45,70 75,33" fill="transparent" />
                    <g id="cross" stroke="black" stroke-width="5" fill="none">
                        <polyline class="cross" id="line-one" points="30,30 70,70" />
                        <polyline class="cross" id="line-two" points="30,70 70,30" />
                    </g>
                </svg>
            </div>
            <div class="err-message"></div>
        </div>
        <div class="buttons">
            <button id="cancel-button" type="button" class="button bg-danger">Cancel</button>
            <button id="submit-button" type="button" class="button bg-success">Confirm</button>
        </div>
    </form>
</div>
`;
template.classList.add("modal");
export class modalDeleteAccount extends HTMLElement {
    private sRoot: ShadowRoot;
    private cancelButton: HTMLButtonElement;
    private confirmButton: HTMLButtonElement;
    private password: FormInput;
    private deleteForm: Form;

    constructor() {
        super();
        this.sRoot = this.attachShadow({ mode: "open"});
        this.sRoot.appendChild(template.cloneNode(true));
        this.password = new FormInput("#delete-password-wrapper", this.sRoot);
        this.deleteForm = new Form("#delete-account-form", [this.password], this.sRoot);

        this.cancelButton = queryElement("#cancel-button", this.sRoot)!;
        this.cancelButton.addEventListener("click", this.remove.bind(this));

        this.confirmButton = queryElement("#submit-button", this.sRoot)!;
        this.confirmButton.addEventListener("click", this.deleteAccount.bind(this));
    } 
    async deleteAccount() {
        if (!this.deleteForm.checkReady) return;

        const data = new FormData(this.deleteForm.elem);
        const headers = { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getCookie("jwt_token")}`
        }

        const request = new Request("accounts/deleteAccount", {
            method: "DELETE",
            headers: headers,
            //@ts-ignore
            body: JSON.stringify(Object.fromEntries(data.entries())),
        });

        const response = await fetch(request);
        switch(response.status) {
            case 401:
                createAlert("Incorrect Password", 5000, AlertColors.WARNING);
            break;
            case 404:
                createAlert("Account no longer exists", 5000, AlertColors.WARNING);
            break;
            case 200:
                createAlert("Account Deleted", 5000, AlertColors.SECONDARY);
            break;
            default:
                createAlert("Something went wrong", 5000, AlertColors.WARNING);
        }
        htmx.ajax("get", "/", ".content");
        history.pushState({}, "", "/login");
    }
    disconnectedCallback() {
        this.cancelButton.removeEventListener("click", this.remove.bind(this));
    }
};

window.customElements.define("modal-delete-account", modalDeleteAccount);
