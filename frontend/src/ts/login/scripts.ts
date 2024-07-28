import { Signal, Computed, createEffect } from "@util/signal";
import { validatePassword, postRequest, queryElement, checkEmail, makeCookie, getCookie } from "./client-util";
import {
    removeClasses,
    inputKeyPressed,
    debounce,
    // queryElement,
    ErrMsg,
    MarkIndicator,
    IndicatorStates,
    createAlert,
    AlertColors,
} from "@util/util";
import htmx from "htmx.org";

if (getCookie("jwt_token")) {
    htmx.ajax("get","/settings", {target: ".content", headers: {"Authentication": `Bearer ${getCookie("jwt_token")}`}});
}

const login: HTMLFormElement | null = document.querySelector("#login-form");

enum FieldStates {
    EMPTY = 0,
    INVALID = 1,
    VALID = 2,
    CHECKING = 3
};


if (login) {
    const email = queryElement<HTMLInputElement>("#email-field");
    const emailState = new Signal<FieldStates>(FieldStates.EMPTY);

    email.addEventListener(
        "input",
        debounce(async function () {
            emailState.value = FieldStates.CHECKING;

            if (email.value.length <= 0) {
                emailState.value = FieldStates.EMPTY;
                return;
            }
            const responseCode = await checkEmail(email.value);
            setTimeout( function () {
                switch (responseCode) {
                    case 409:
                        emailState.value = FieldStates.VALID;
                    break;
                    default:
                        emailState.value = FieldStates.INVALID;
                }
            }, 250);
        }, 1000)
    );

    createEffect(() => {
        const emailIndicator = new MarkIndicator(email);
        const emailMsg = new ErrMsg(email);

        switch (emailState.value) { 
            case FieldStates.EMPTY:
                emailIndicator.setState(IndicatorStates.HIDDEN);
                emailMsg.setMsg("");
            break;
            case FieldStates.INVALID:
                emailIndicator.setState(IndicatorStates.DENY);
                emailMsg.setMsg("No account asscociated with that email");
            break;
            case FieldStates.VALID:
                emailIndicator.setState(IndicatorStates.ALLOW);
                emailMsg.setMsg("");
            break;
            default:
                emailIndicator.setState(IndicatorStates.PROGRESS);
                emailMsg.setMsg("");
            break;
        }
    });

    const password = queryElement<HTMLInputElement>("#password-field");
    const passwordState = new Signal<FieldStates>(FieldStates.EMPTY);

    createEffect(() => {
        const passwordIndicator = new MarkIndicator(password);

        switch(passwordState.value) {
            case FieldStates.INVALID:
                passwordIndicator.setState(IndicatorStates.DENY);
            break;
            default:
                passwordIndicator.setState(IndicatorStates.HIDDEN);
            break;

        }
    });


    const loginFields = {
          email: { input: email, state: emailState, valid: new Computed(() => emailState.value === FieldStates.VALID)},
          password: { input: password, state: passwordState, valid: new Computed(() => passwordState.value === FieldStates.VALID) },
    };
    type field = keyof typeof loginFields;

    password.addEventListener(
        "input",
        function () {
            passwordState.value = FieldStates.EMPTY;
            if (password.value.length > 0) {
                passwordState.value = FieldStates.VALID;
            }
        }
    );
    login.addEventListener("submit", async function (evt) {
        evt.preventDefault();
        for (let key in loginFields) {
            const fieldObj = loginFields[key as field];
            const isValid: boolean = fieldObj.valid.value;

            if (!isValid) {
                fieldObj.state.value = FieldStates.INVALID;
                createAlert("Must fill out all fields", 5000, AlertColors.WARNING);
            }
        }
        const data = new FormData(login);
        const headers = [{ "Content-Type": "application/json" }]

        const loginData = await postRequest("/accounts/login", headers, data);
        loginData.body.then(
            (res) => {
                document.cookie = makeCookie("jwt_token", res.token, res.expiresIn)
            }
        )

        switch (loginData.status) {
            case 200:
                htmx.ajax("get","/", ".content");
                history.pushState(null, "", "/")
            break;
            default:
                createAlert("Incorrect password", 5000, AlertColors.WARNING);
        }
    });
}

const register: HTMLFormElement | null = document.querySelector("#register-form");

if (register) {
    const email: HTMLInputElement = queryElement<HTMLInputElement>("#email-field");
    const emailIndicator = new MarkIndicator(email);
    const emailMsg = new ErrMsg(email);

    var emailEmpty = true;

    const username: HTMLInputElement = queryElement<HTMLInputElement>("#username-field");
    const usernameIndicator = new MarkIndicator(username);
    const usernameMsg = new ErrMsg(username);

    const password: HTMLInputElement = queryElement<HTMLInputElement>("#password-field");
    const passwordIndicator = new MarkIndicator(password);
    const passwordStrength = queryElement("#password-field ~ .strength");
    const passwordChecklist = queryElement("#password-field ~ .checklist");

    const confirmPassword: HTMLInputElement = queryElement<HTMLInputElement>("#confirm-password-field");
    const confirmPasswordIndicator = new MarkIndicator(confirmPassword);
    const confirmPasswordMsg = new ErrMsg(confirmPassword);

    const fieldsValidity = {
        email: false,
        username: false,
        password: false,
        confirmPassword: confirmPassword ? false : true,
    };

    type inputField = keyof typeof fieldsValidity;

    function updateFieldValidity(field: inputField, isValid: boolean) {
        fieldsValidity[field] = isValid;
    }

    function updateConfirm() {
        confirmPasswordMsg.setMsg("");
        updateFieldValidity("password", false);

        if (confirmPassword.value.length <= 0) {
            confirmPasswordIndicator.setState(IndicatorStates.HIDDEN);
            return;
        } else if (confirmPassword.value != password!.value) {
            confirmPasswordMsg.setMsg("Passwords do not match");
            confirmPasswordIndicator.setState(IndicatorStates.DENY);
            return;
        }

        updateFieldValidity("password", true);
        confirmPasswordIndicator.setState(IndicatorStates.ALLOW);
    }

    // email input hanlders -------------------------------------------
    email.addEventListener("keydown", function (e) {
        if (emailEmpty || !inputKeyPressed(e as KeyboardEvent)) {
            return;
        }
        emailIndicator.setState(IndicatorStates.PROGRESS);
        updateFieldValidity("email", false);
    });

    email.addEventListener(
        "input",
        debounce(async function () {
            emailIndicator.setState(IndicatorStates.PROGRESS);
            emailEmpty = false;
            emailMsg.setMsg("");
            updateFieldValidity("email", false);

            if (email.value.length <= 0) {
                emailEmpty = true;
                emailIndicator.setState(IndicatorStates.DENY);
                return;
            }

            const responseStatus: number = await checkEmail(email.value);

            setTimeout(() => {
                switch (responseStatus) {
                    case 200:
                        emailIndicator.setState(IndicatorStates.ALLOW);
                        updateFieldValidity("email", true);
                        break;
                    case 409:
                        emailMsg.setMsg("Account already asscociated with that email");
                        emailIndicator.setState(IndicatorStates.DENY);
                        break;
                    default:
                        emailMsg.setMsg("Not valid email format");
                        emailIndicator.setState(IndicatorStates.DENY);
                        break;
                }
            }, 250);
        }, 1000),
    );

    // username input hanlders -------------------------------------------
    username.addEventListener(
        "input",
        debounce(function () {
            usernameMsg.setMsg("");
            usernameIndicator.setState(IndicatorStates.HIDDEN);
            updateFieldValidity("username", false);

            const enteredName = username.value;
            if (enteredName.length <= 0) {
                return;
            }
            if (enteredName.search(/[^A-Za-z0-9]/) > -1) {
                usernameMsg.setMsg("Username cannot contain special characters or spaces");
                usernameIndicator.setState(IndicatorStates.DENY);
                return;
            }

            usernameIndicator.setState(IndicatorStates.ALLOW);
            updateFieldValidity("username", true);
        }, 500),
    );

    // password input hanlders -------------------------------------------
    let updateStrength = debounce(function (strength: number) {
        if (passwordStrength) {
            removeClasses(passwordStrength, ["strength-1", "strength-2", "strength-3", "strength-4"]);
        }

        if (password.value.length > 0) {
            if (passwordStrength) passwordStrength.classList.add("strength-" + strength);

            if (strength >= 4) {
                updateConfirm();
                updateFieldValidity("password", true);
                passwordIndicator.setState(IndicatorStates.ALLOW);
                return;
            }
        }
        passwordIndicator.setState(IndicatorStates.DENY);
    }, 250);

    password.addEventListener("input", () => {
        const passwordInput = password.value;
        updateFieldValidity("password", false);

        const validation = [
            passwordInput.length > 8 ? 1 : 0,
            passwordInput.search(/[A-Z]/) > -1 ? 1 : 0,
            passwordInput.search(/[0-9]/) > -1 ? 1 : 0,
            passwordInput.search(/[!@#$%^&*,;\.]/) > -1 ? 1 : 0,
        ];

        const strength = validatePassword(validation);
        updateStrength(strength);

        if (passwordChecklist) {
            for (let i = 0; i < validation.length; i++) {
                const li = passwordChecklist.children.item(i)!;
                if (validation[i]) {
                    li.classList.add("checked");
                } else {
                    li.classList.remove("checked");
                }
            }
        }
    });

    // confirm-password input hanlders -------------------------------------------
    confirmPassword.addEventListener("input", debounce(updateConfirm, 500));

    interface FormField {
        input: HTMLInputElement;
        indicator: MarkIndicator;
    }

    const formFields: FormField[] = [
        { input: email, indicator: emailIndicator },
        { input: username, indicator: usernameIndicator },
        { input: password, indicator: passwordIndicator },
        { input: confirmPassword, indicator: confirmPasswordIndicator },
    ];

    // register submit handler ---------------------------------------------------
    register.addEventListener("submit", async function (evt) {
        evt.preventDefault();

        let aFieldIsNotFilled = false;
        formFields.forEach((field) => {
            if (!field.input.value) {
                field.indicator.setState(IndicatorStates.DENY);
                aFieldIsNotFilled = true;
            }
        });
        if (aFieldIsNotFilled) {
            createAlert("All fields must be properly filled out", 5000, AlertColors.WARNING);
            return;
        }
        const passwordDoNotMatch = confirmPassword && password.value !== confirmPassword.value;
        if (passwordDoNotMatch) {
            confirmPasswordIndicator.setState(IndicatorStates.DENY);
            createAlert("Passwords do not match", 5000, AlertColors.WARNING);
            return;
        }

        const data = new FormData(register);
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
    });
}
