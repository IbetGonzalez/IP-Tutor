import { deleteAccountModal } from "@components/deleteAccountModal";
import { createState, ErrMsg, Form, FormInput, IndicatorStates, InputStates, MarkIndicator, PasswordEye } from "@components/form";
import { checkEmail, EmailStatus, getCookie, queryElement, updateField, validatePassword } from "@util/client-util";
import { Signal, Effect, Computed, createEffect } from "@util/signal";
import { debounce, AlertColors, createAlert, removeClasses } from "@util/util";
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

    private password: FormInput;
    private eye: PasswordEye;
    private oldEye: PasswordEye;
    private passwordStrength: Computed | null;
    private manageStrength: Effect | null;
    private managePasswordStates: Effect | null;

    private oldPassword: FormInput;
    private manageOldPasswordInput: Effect | null;
    private manageOldPasswordState: Effect | null;

    private email: FormInput;
    private manageEmailInput: Effect | null;
    private manageEmailState: Effect | null;

    private username: FormInput;
    private manageUsernameInput: Effect | null;
    private manageUsernameState: Effect | null;

    constructor() {
        super();
        this.accountInfo = new Signal<accountData>({
            username: "",
            email: "",
            accountCreated: "",
        } as accountData)

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
            switch (state.value) {
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
        this.eye = new PasswordEye(this.password);
        this.oldPassword = new FormInput("#old-password-wrapper");
        this.oldEye = new PasswordEye(this.oldPassword);

        this.manageOldPasswordInput = new Effect(() => {
            const input = this.oldPassword.value;
            if (input.length > 0) {
                this.oldPassword.state = createState(InputStates.VALID);
            } else {
                this.oldPassword.state = createState(InputStates.EMPTY);
            }
        });
        this.manageOldPasswordState = new Effect(() => {
            const state = this.oldPassword.state;
            const indicator = new MarkIndicator(this.oldPassword.wrapper);
            const msg = new ErrMsg(this.oldPassword.wrapper);

            msg.setMsg(state.msg);
            switch (state.value) {
                case InputStates.INVALID:
                    indicator.setState(IndicatorStates.DENY);
                    break;
                default:
                    indicator.setState(IndicatorStates.HIDDEN);
            }

        });
        this.passwordStrength = new Computed(() => {
            const input = this.password.value;
            const strengthChecklist: HTMLElement | null = this.password.wrapper.querySelector(".checklist");
            if (input.length > 0) {
                this.oldPassword.wrapper.classList.remove("hidden");
                queryElement("#old-password-name").classList.remove("hidden");
            } else {
                this.oldPassword.wrapper.classList.add("hidden");
                queryElement("#old-password-name").classList.add("hidden");
            }

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
            const strength = this.passwordStrength!.value;
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
            switch (state.value) {
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

        this.email = new FormInput("#email-wrapper");
        this.manageEmailInput = createEffect(() => {
            const input = this.email.value;

            this.email.state = createState(InputStates.CHECKING, "");
            if (input.length < 1) {
                this.email.state = createState(InputStates.EMPTY);
                this.oldPassword.wrapper.classList.add("hidden");
                queryElement("#old-password-name").classList.add("hidden");
                return;
            } 
            this.oldPassword.wrapper.classList.remove("hidden");
            queryElement("#old-password-name").classList.remove("hidden");
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


        this.settingsButtons = Array.from(document.querySelectorAll(".button"));
        this.settingsButtons.forEach((btnElem) => {
            btnElem.addEventListener("click", this.handlerBtnClick.bind(this));
        });

        this.updateSettings = new Effect(() => {
            const data: accountData = this.accountInfo.value;
            (<HTMLInputElement>queryElement("#username-field")).value = data.username;
            (<HTMLInputElement>queryElement("#email-field")).value = data.email;
        });

        this.modal_DeleteAccount = deleteAccountModal(this.sendHome);
    }
    connectedCallback() {
        this.fetchAccountInfo();
    }
    disconnectedCallback() {
        this.eye.cleanup();
        this.manageStrength = null;
        this.managePasswordStates = null;
        this.passwordStrength = null;
        this.password.cleanup();

        this.manageOldPasswordInput = null;
        this.manageOldPasswordState = null;
        this.oldPassword.cleanup();

        this.manageUsernameInput = null;
        this.manageUsernameState = null;
        this.username.cleanup();

        this.manageEmailInput = null;
        this.manageEmailState = null;
        this.email.cleanup();

        this.settingsButtons.forEach(
            elem => elem.removeEventListener("click", this.handlerBtnClick.bind(this))
        );
    }

    validateInput = debounce(
        async (userInput: string) => {
            const emailStatus = await checkEmail(userInput);

            switch (emailStatus) {
                case EmailStatus.EXISTS:
                    if (this.email.value === this.accountInfo.value.email) {
                        this.email.state = createState(InputStates.EMPTY);
                        return;
                    }
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
    handlerBtnClick(e: Event) {
        const btnElem: HTMLButtonElement | null = e.target as HTMLButtonElement;
        e.preventDefault();
        if (!btnElem) {
            return;
        }
        const action = btnElem.getAttribute("action");
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
                    if (res.status === 200) {
                        createAlert("Successfuly logged out", 2500, AlertColors.SUCCESS);
                        this.sendHome();
                    } else {
                        createAlert("Something went wrong", 2500, AlertColors.DANGER);
                    }
                });
                break;
            case "cancel":
                this.accountInfo.notify();
                break;
            case "save":
                this.saveSettings();
                break;
            default:
                return;
        }
    }
    async saveSettings() {
        const updated: string[] = [];
        // Check Username and Update if necessary
        if (this.username.value.length > 0 && this.username.value !== this.accountInfo.value.username) {

            await updateField("username", this.username.value).then((res) => {
                if (!res) {
                    createAlert("Could not update username. Format may be invalid", 2500, AlertColors.DANGER);
                    return;
                } else {
                    updated.push("username");
                }
            })
        }

        // Check email and update if necessary
        if (this.email.value.length > 0 && this.email.value !== this.accountInfo.value.email) {
            let passwordValid = true;
            if (this.password.state.value !== InputStates.VALID) {
                this.password.state = createState(InputStates.INVALID, "Field required");
                passwordValid = false;
            }
            if (!passwordValid) return;

            await updateField("email", (<HTMLInputElement>queryElement("#email-field")).value).then((res) => {
                if (!res) {
                    createAlert("Could not update email. Format may be invalid.", 2500, AlertColors.DANGER);
                    return;
                } else {
                    updated.push("email");
                }
            })
        }

        // Check password and update if necessary
        if (this.password.value.length > 0) {
            let fieldsValid = true;
            if (this.oldPassword.state.value !== InputStates.VALID || this.oldPassword.value.length <= 0) {
                this.oldPassword.state = createState(InputStates.INVALID, "Password required");
                fieldsValid= false;
            }
            if (this.password.state.value !== InputStates.VALID) {
                console.log("exiting");
                this.password.state = createState(InputStates.INVALID, "Password not acceptable");
                fieldsValid = false;
            }
            if (!fieldsValid) return;

            await updateField("password", this.password.value, this.oldPassword.value).then((res) => {
                if (!res) { createAlert("Could not update password. Old password may be invalid", 2500, AlertColors.DANGER); return;
                } else {
                    updated.push("password");
                }
            })
        }
        if (updated.length > 0) {
            createAlert(`Updated ${updated.join(",")}`, 2500, AlertColors.SUCCESS);
            this.fetchAccountInfo();
        }
    }

    sendHome() {
        htmx.ajax("get", "/", ".content");
        history.pushState(null, "", "/")
    }

    fetchAccountInfo() {
        const jwt = getCookie("jwt_token");
        const infoRequest = new Request("accounts/getData", {
            headers: { Authorization: `Bearer ${jwt}` }
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
