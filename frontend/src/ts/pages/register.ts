import { createState, ErrMsg, Form, FormInput, IndicatorStates, InputStates, MarkIndicator } from "@components/form";
import { checkEmail, EmailStatus, getCookie, makeCookie, postRequest, validatePassword   } from "@util/client-util";
import { Effect, Computed, createEffect } from "@util/signal";
import { AlertColors, createAlert, debounce, removeClasses } from "@util/util";
import htmx from "htmx.org";
const template = `
        <form id="register-form" class="form center text-center w-med">
            <div id="email-wrapper" class="form-input">
                <input class="text-input" id="email-field" name="email" type="text" placeholder="email" />
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
            <div id="username-wrapper" class="form-input">
                <input class="text-input" id="username-field" name="username" type="text" placeholder="Username" />
                <label class="text-input-label" for="#username-field">Create Username</label>
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
                <label class="text-input-label" for="#password-field">Create Password</label>
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
                <div class="strength">
                    <span class="bar" id="bar-1"></span>
                    <span class="bar" id="bar-2"></span>
                    <span class="bar" id="bar-3"></span>
                    <span class="bar" id="bar-4"></span>
                </div>
                <div class="err-message"></div>
                <ul class="checklist">
                    <li>Must be at least 8 characters</li>
                    <li>Must contain a capital letter</li>
                    <li>Must contain a number</li>
                    <li>Must contain a special character (!@#$%^&*;,.)</li>
                </ul>
            </div>
            <br />
            <div id="confirm-password-wrapper" class="form-input">
                <input
                    class="text-input"
                    id="confirm-password-field"
                    name="confirm-password"
                    type="password"
                    placeholder="Password"
                />
                <label class="text-input-label" for="#confirm-password-field">Confirm Password</label>
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
            <button id="submit-button" type="button" class="button">Submit</button>
            <br />
        </form>
`;


class RegisterForm extends HTMLElement {
    private email: FormInput;
    private username: FormInput;
    private password: FormInput;
    private confirmPassword: FormInput;
    private objForm: Form;

    private manageEmailInput: Effect | null;
    private manageEmailState: Effect | null; 
    private manageUsernameInput: Effect | null;
    private manageUsernameState: Effect | null;
    private passwordStrength: Computed | null;
    private manageStrength: Effect | null;
    private managePasswordStates: Effect | null;
    private passwordMatch: Computed | null;
    private manageConfirmState: Effect | null;

    constructor() {
        super();
        this.innerHTML = template;
        this.email = new FormInput("#email-wrapper");
        this.manageEmailInput = createEffect(() => {
            const input = this.email.value;

            this.email.state = createState(InputStates.CHECKING, "");
            if (input.length < 1) {
                this.email.state = createState(InputStates.EMPTY);
                return;
            }
            this.validateInput(input);
        });
        this.manageEmailState = createEffect(() => {
            const state = this.email.state;
            const indicator = new MarkIndicator(this.email.wrapper);
            const msg = new ErrMsg(this.email.wrapper);

            msg.setMsg(state.msg);
            switch (state.value) {
                case InputStates.EMPTY:
                    indicator.setState(IndicatorStates.HIDDEN);
                break;
                case InputStates.CHECKING:
                    indicator.setState(IndicatorStates.PROGRESS);
                break;
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


        this.username = new FormInput("#username-wrapper");
        this.manageUsernameInput = createEffect(() => {
            const input = this.username.value;

            if (input.length < 1) {
                this.username.state = createState(InputStates.EMPTY);
                return;
            }

            if (input.search(/[^A-Za-z0-9&!_@\-.]/) > -1) {
                this.username.state = createState(InputStates.INVALID, "Username may only contain the following special characters: ! & @ _ - .");
                return;
            }
            this.username.state = createState(InputStates.VALID);
        })
        this.manageUsernameState = createEffect(() => {
            const state = this.username.state;
            const indicator = new MarkIndicator(this.username.wrapper);
            const msg = new ErrMsg(this.username.wrapper);

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
        })

    
        this.password = new FormInput("#password-wrapper");
        this.passwordStrength = new Computed(() => {
            const input = this.password.value;
            const strengthChecklist: HTMLElement | null = this.password.wrapper.querySelector(".checklist");

            const validation = [
                input.length > 8 ? 1 : 0,
                input.search(/[A-Z]/) > -1 ? 1 : 0,
                input.search(/[0-9]/) > -1 ? 1 : 0,
                input.search(/[!@#$%^&*,;\.]/) > -1 ? 1 : 0,
            ];
            if (strengthChecklist) {
                for (let i = 0; i < validation.length; i++) {
                    const li = strengthChecklist.children.item(i)!;
                    if (validation[i]) {
                        li.classList.add("checked");
                    } else {
                        li.classList.remove("checked");
                    }
                }
            }

            if (input.length < 1) {
                this.password.state = createState(InputStates.EMPTY);
                return 0;
            }
            return validatePassword(validation);
        });

        this.manageStrength = createEffect(() => {
            const strength = this.passwordStrength.value;
            const strengthIndicator: HTMLElement | null = this.password.wrapper.querySelector(".strength");

            if (strengthIndicator) {
                removeClasses(strengthIndicator, ["strength-1", "strength-2", "strength-3", "strength-4"]);
                if (strength > 0) strengthIndicator.classList.add(`strength-${strength}`);

            }
            if (strength === 0) {
                this.password.state = createState(InputStates.EMPTY);
                return;
            }
            if (strength >= 4) {
                this.password.state = createState(InputStates.VALID);
                return;
            }
            this.password.state = createState(InputStates.INVALID);
        });

        this.managePasswordStates = createEffect(() => {
            const state = this.password.state;
            const indicator = new MarkIndicator(this.password.wrapper);
            const msg = new ErrMsg(this.password.wrapper);

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
        this.confirmPassword = new FormInput("#confirm-password-wrapper");

        this.passwordMatch = new Computed(() => {
            const passwordInput = this.password.value;
            const confirmPasswordInput = this.confirmPassword.value;

            this.confirmMatch(passwordInput, confirmPasswordInput);
        });

        this.manageConfirmState = createEffect(() => {
            const state = this.confirmPassword.state;
            const indicator = new MarkIndicator(this.confirmPassword.wrapper);
            const msg = new ErrMsg(this.confirmPassword.wrapper);

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

        this.objForm = new Form("#register-form", [this.email, this.username, this.password, this.confirmPassword]);
        this.objForm.elem.addEventListener("keydown", this.handleBtnDown.bind(this));
        this.objForm.submitBtn.addEventListener("click", this.register.bind(this));
    }

    handleBtnDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            this.register();
        }
    }
    async register() {
        if (!this.objForm.checkReady) return;

        const data = new FormData(this.objForm.elem);
        const headers = [{ "Content-Type": "application/json" }]
        data.delete("confirm-password");

        try {
            const created = await postRequest("/accounts/create", headers, data);

            createAlert("Account created", 5000, AlertColors.SECONDARY);
            if (created.status == 201) {
                htmx.ajax("get", "/settings", ".content");
                history.pushState(null, "", "/settings");
            } else {
                throw new Error("Error: " + created);
            }
        } catch (e) {
            console.error(JSON.stringify(e));
            createAlert("Could not create account", 5000, AlertColors.WARNING);
        }
    }

    confirmMatch = debounce((p1: string, p2: string) => {
        if (this.password.state.value !== InputStates.VALID) {
            this.confirmPassword.state = createState(InputStates.EMPTY);
            return;
        }
        if (p1.length === 0 || p2.length === 0 ) {
            this.confirmPassword.state = createState(InputStates.EMPTY);
            return;
        }
        if (p1 !== p2) {
            this.confirmPassword.state = createState(InputStates.INVALID, "Passwords do not match");
            return;
        }
        this.confirmPassword.state = createState(InputStates.VALID);
    }, 500);
    validateInput = debounce(
            async (userInput: string) => {
                const emailStatus = await checkEmail(userInput);

                switch (emailStatus) {
                    case EmailStatus.EXISTS:
                        this.email.state = createState(InputStates.INVALID, "Account already associated with that email");
                    break;
                    case EmailStatus.AVAILABLE:
                        this.email.state = createState(InputStates.VALID);
                    break;
                    default:
                        this.email.state = createState(InputStates.INVALID, "Invalid format");
                }
            }
        , 1000);
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
        this.manageUsernameInput = null;
        this.manageUsernameState = null;
        this.passwordStrength = null;
        this.manageStrength = null;
        this.managePasswordStates = null;
        this.passwordMatch = null;
        this.manageConfirmState = null;

        this.objForm.submitBtn.removeEventListener('click', this.register.bind(this));
        this.objForm.elem.removeEventListener('keydown', this.handleBtnDown.bind(this));
        this.objForm.cleanup();
    }
}
window.customElements.define("register-form", RegisterForm);
