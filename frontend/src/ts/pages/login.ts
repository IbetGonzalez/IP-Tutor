import { 
    FormInput, 
    InputStates,
    ErrMsg,
    IndicatorStates,
    MarkIndicator, 
    createState,
    Form
} from "@components/form";
import { getCookie, postRequest } from "@util/client-util";
import { createEffect, Effect } from "@util/signal";
import { AlertColors, createAlert } from "@util/util";
import htmx from "htmx.org";
const template = `
            <form id="login-form" class="form text-center center w-med">
                <div id="email-wrapper" class="form-input">
                    <input id="email-field" class="text-input" name="email" type="text" placeholder="Username" />
                    <label class="text-input-label" for="#email-field">Email</label>
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
                <br />
                <div id="password-wrapper" class="form-input">
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
                <br />
                <br />
                <button id="submit-button" type="button" class="button bg-primary">Login</button>
                <br />
            </form> `;

class LoginForm extends HTMLElement {
    private objForm: Form;
    private email: FormInput;
    /* 
    *   manageEmailInput is an effect that run anytime "email.value" is updated
    *   based on length and validity of the email it updates the state of the email field
    */
    private manageEmailInput: Effect | null;
    /* 
    *   manageEmailState is run when the states is updated
    *   defines the states how how they should be visually represented
    *   
    */
    private manageEmailState: Effect | null;
    private password: FormInput;
    private managePasswordInput: Effect | null
    private managePasswordState: Effect | null

    constructor() {
        super();
        this.innerHTML = template;
        /*  
        *   Email field Initialization
        */
        this.email = new FormInput("#email-wrapper");
        this.manageEmailInput = createEffect(() => {
            const userInput = this.email.value;

            if (userInput.length < 1) {
                this.email.state = createState(InputStates.EMPTY);
                return;
            }
            this.email.state = createState(InputStates.VALID);
        });
        this.manageEmailState = createEffect(() => {
            const state = this.email.state;
            const indicator = new MarkIndicator(this.email.wrapper);
            const msg = new ErrMsg(this.email.wrapper);

            msg.setMsg(state.msg);
            switch (state.value) {
                case InputStates.INVALID:
                    indicator.setState(IndicatorStates.DENY);
                break;
                default:
                    indicator.setState(IndicatorStates.HIDDEN);
            }
        });
        /*  
        *   Password field Initialization
        */

        this.password = new FormInput("#password-wrapper");
        this.managePasswordInput = createEffect(() => {
            const userInput = this.password.value;

            if (userInput.length < 1) {
                this.password.state = createState(InputStates.EMPTY);
                return
            }
            this.password.state = createState(InputStates.VALID);
        });
        this.managePasswordState = createEffect(() => {
            const state = this.password.state;
            const indicator = new MarkIndicator(this.password.wrapper);
            const msg = new ErrMsg(this.password.wrapper);

            msg.setMsg(state.msg);
            switch(state.value) {
                case InputStates.INVALID:
                    indicator.setState(IndicatorStates.DENY);
                break;
                default:
                    indicator.setState(IndicatorStates.HIDDEN);
            }
        });
        this.objForm = new Form(`#login-form`, [this.email, this.password]);
        this.objForm.elem.addEventListener('keydown', this.handleBtnDown.bind(this));
        this.objForm.submitBtn.addEventListener('click', this.login.bind(this));
    }

    handleBtnDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            this.login();
        }
    }

    async login () {
        if (!this.objForm.checkReady) {
            return;
        }
        const data = new FormData(this.objForm.elem);
        const headers = [{ "Content-Type": "application/json" }]

        const loginData = await postRequest("/accounts/login", headers, data);

        switch (loginData.status) {
            case 200:
                htmx.ajax("get","/", ".content");
                history.pushState(null, "", "/")
            break;
            default:
                createAlert("Email or password is invalid", 5000, AlertColors.DANGER);
        }
    }

    connectedCallback() {
        if (getCookie("jwt_token")) {
            htmx.ajax("get", "/settings", {
                target: ".content",
                headers: { "Authorization": `Bearer ${getCookie("jwt_token")}`}
            });
            history.pushState(null, "", "/settings")
        }
    }
    disconnectedCallback() {
        this.manageEmailInput = null;
        this.manageEmailState = null;
        this.managePasswordInput= null;
        this.managePasswordState = null;
        this.objForm.submitBtn.removeEventListener('click', this.login.bind(this));
        this.objForm.elem.removeEventListener('keydown', this.handleBtnDown.bind(this));
        this.objForm.cleanup();
    }
}
window.customElements.define("login-form", LoginForm);
