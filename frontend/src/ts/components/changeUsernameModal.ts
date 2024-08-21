import { createState, ErrMsg, Form, FormInput, IndicatorStates, InputStates, MarkIndicator } from "@components/form";
import { getCookie } from "@util/client-util";
import { createEffect } from "@util/signal";
import { AlertColors, createAlert } from "@util/util";

export const changeUsernameModal = (callback = () => {}) => {
    const modal: HTMLElement = document.createElement('div');
    let isOpen = false;
    modal.classList.add("modal");
    modal.innerHTML = `
    <form class="card" id="change-username-form">
        <div id="username-wrapper" class="form-input wrapper" style="--gradient1: var(--secondary); --gradient2: #0b6e4f">
            <input id="username-field" name="username" type="text" class="text-input" placeholder="New Username">
            <label class="text-input-label" for"#username-field">New Username</label>
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

    const showModal= () => {
        if (isOpen) {
            console.warn("Modal is already open");
            return;
        }
        document.body.appendChild(modal);
        isOpen = true;


        const escape = (e: KeyboardEvent) => {
            if (e.key === "Escape") { 
                cleanup();
            }
        }

        const cleanup = () => {
            isOpen = false;
            document.removeEventListener("keydown", escape);
            document.body.removeChild(modal);
        }
        
        document.addEventListener("keydown", escape);
        modal.querySelector("#cancel-button")?.addEventListener("click", cleanup);

        const usernameInput = new FormInput("#username-wrapper");
        const changeUsernameForm = new Form("#change-username-form", [usernameInput]);

        const changeUsername = async () => {
            const data = new FormData(changeUsernameForm.elem);

            const headers = { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getCookie("jwt_token")}`
            }
            
            const request = new Request("accounts/update/username", {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(Object.fromEntries(data.entries())),
            });

            const response = await fetch(request);

            if (response.status == 200) {
                createAlert("Username updated", 5000, AlertColors.SECONDARY);
            } else {
                createAlert("Something went wrong", 5000, AlertColors.WARNING);
            }
            callback();
            cleanup();
        }

        const checkInput = createEffect(() => {
            const input = usernameInput.value;

            if (input.length < 1) {
                usernameInput.state = createState(InputStates.EMPTY);
                return;
            }

            if (input.search(/[^A-Za-z0-9&!_@\-.]/) > -1) {
                usernameInput.state = createState(InputStates.INVALID, "Username may only contain the following special characters: ! & @ _ - .");
                return;
            }

            usernameInput.state = createState(InputStates.VALID);
        });

        const manageUsernameState = createEffect(() => {
            const state = usernameInput.state;
            const indicator = new MarkIndicator(usernameInput.wrapper);
            const msg = new ErrMsg(usernameInput.wrapper);

            msg.setMsg(state.msg);
            switch(state.value) {
                case InputStates.VALID:
                    indicator.setState(IndicatorStates.ALLOW);
                break;
                case InputStates.INVALID:
                    indicator.setState(IndicatorStates.DENY);
                break;
                default:
                    indicator.setState(IndicatorStates.HIDDEN);
            }
        });
     
        changeUsernameForm.elem.addEventListener("keydown", (e: KeyboardEvent) => {
             if (e.key === "Enter") {
                e.preventDefault();
                if (!changeUsernameForm.checkReady) return;
                changeUsername();
            }
        });

        changeUsernameForm.submitBtn.addEventListener("click", () => {
            if (!changeUsernameForm.checkReady) return;
            changeUsername();
        })
    }
    return {
        elem: modal,
        showModal: showModal
    }
}

