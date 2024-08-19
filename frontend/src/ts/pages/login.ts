import { 
    FormInput, 
    InputStates,
    ErrMsg,
    IndicatorStates,
    MarkIndicator, 
    createState,
    Form,
    PasswordEye
} from "@components/form";
import { getCookie, postRequest, queryElement } from "@util/client-util";
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
                    <div class="eye closed">
                        <svg id="closed-eye" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path d="M19.604 2.562l-3.346 3.137c-1.27-.428-2.686-.699-4.243-.699-7.569 0-12.015 6.551-12.015 6.551s1.928 2.951 5.146 5.138l-2.911 2.909 1.414 1.414 17.37-17.035-1.415-1.415zm-6.016 5.779c-3.288-1.453-6.681 1.908-5.265 5.206l-1.726 1.707c-1.814-1.16-3.225-2.65-4.06-3.66 1.493-1.648 4.817-4.594 9.478-4.594.927 0 1.796.119 2.61.315l-1.037 1.026zm-2.883 7.431l5.09-4.993c1.017 3.111-2.003 6.067-5.09 4.993zm13.295-4.221s-4.252 7.449-11.985 7.449c-1.379 0-2.662-.291-3.851-.737l1.614-1.583c.715.193 1.458.32 2.237.32 4.791 0 8.104-3.527 9.504-5.364-.729-.822-1.956-1.99-3.587-2.952l1.489-1.46c2.982 1.9 4.579 4.327 4.579 4.327z"/></svg>
                        <svg id="open-eye" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path d="M12.015 7c4.751 0 8.063 3.012 9.504 4.636-1.401 1.837-4.713 5.364-9.504 5.364-4.42 0-7.93-3.536-9.478-5.407 1.493-1.647 4.817-4.593 9.478-4.593zm0-2c-7.569 0-12.015 6.551-12.015 6.551s4.835 7.449 12.015 7.449c7.733 0 11.985-7.449 11.985-7.449s-4.291-6.551-11.985-6.551zm-.015 3c-2.209 0-4 1.792-4 4 0 2.209 1.791 4 4 4s4-1.791 4-4c0-2.208-1.791-4-4-4z"/></svg>
                    </div>
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
    private eye: PasswordEye;


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
        this.eye = new PasswordEye(this.password);

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
        this.eye.cleanup();
        this.objForm.cleanup();
    }
}
window.customElements.define("login-form", LoginForm);
