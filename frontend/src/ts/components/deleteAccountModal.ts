import { createEffect } from "@util/signal";
import { createState, ErrMsg, Form, FormInput, IndicatorStates, InputStates, MarkIndicator } from "./form";
import { getCookie } from "@util/client-util";
import { AlertColors, createAlert } from "@util/util";

export const deleteAccountModal = (callback = () => {}) => {
    const modal:HTMLElement =  document.createElement('div');
    modal.classList.add("modal");
    modal.innerHTML= `
        <form class="card" id="delete-account-form">
            <div id="delete-password-wrapper" class="form-input" style="place-self: center;grid-column: 1 / -1;">
                <input class="text-input" id="password-field" name="password" type="password" placeholder="Password" />
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
            <button id="cancel-button" type="button" class="button bg-danger">Cancel</button>
            <button id="submit-button" type="button" class="button bg-success">Confirm</button>
        </form>
    `;
    const showModal = () => {
        document.body.appendChild(modal);

        const escape = (e: KeyboardEvent) => {
            if (e.key === "Escape") { 
                cleanup();
            }
        };

        const cleanup = () => {
            document.removeEventListener("keydown", escape);
            document.body.removeChild(modal);
        };
        
        document.addEventListener("keydown", escape);
        modal.querySelector("#cancel-button")?.addEventListener("click", cleanup);
        const password = new FormInput("#delete-password-wrapper");
        const deleteForm = new Form("#delete-account-form", [password]);

        const managePasswordInput = createEffect(() => {
            const userInput = password.value;

            if (userInput.length < 1) {
                password.state = createState(InputStates.EMPTY);
                return
            }
            password.state = createState(InputStates.VALID);
        });

        const managePasswordState = createEffect(() => {
            const state = password.state;
            const indicator = new MarkIndicator(password.wrapper);
            const msg = new ErrMsg(password.wrapper);

            msg.setMsg(state.msg);
            switch(state.value) {
                case InputStates.INVALID:
                    indicator.setState(IndicatorStates.DENY);
                break;
                default:
                    indicator.setState(IndicatorStates.HIDDEN);
            }
        });

        const deleteAccount = async () => {
            if (!deleteForm.checkReady) return;

            const data = new FormData(deleteForm.elem);
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
            callback();
            cleanup();
        };
        deleteForm.submitBtn.addEventListener("click", deleteAccount);
        deleteForm.elem.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
            }
        })
    }
    return {
        elem: modal,
        showModal: showModal
    }
}
