import { validatePassword, getCookie } from "./client-util";
import { removeClasses, inputKeyPressed, debounce, queryElement, ErrMsg, MarkIndicator, IndicatorStates } from "../util/util";
import htmx from "htmx.org";

const login = document.querySelector("#login-form");
if (login) {
    login.addEventListener("htmx:confirm", function (evt) {
        evt.preventDefault();
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

    const submitBtn: HTMLButtonElement | null = register.querySelector("#submit-button");
    if (!submitBtn) {
        throw new Error(`No submit button, expecting #submit-button.`);
    }

    const fieldsValidity = {
        email: false,
        username: false,
        password: false,
        confirmPassword: confirmPassword ? false: true,
    }

    type inputField = keyof typeof fieldsValidity;

    function updateFieldValidity(field: inputField, isValid: boolean) {
        submitBtn!.disabled = !isValid;
        fieldsValidity[field] = isValid;
    }

    async function checkEmail (email: string): Promise<boolean>{
        const data = new FormData();
        data.append("email", email);

        try {
            const isValid = await postRequest("/accounts/checkEmail", data);
            return isValid;
        } catch (e) {
            console.warn(`Error in checkEmail(): ${e}`);
            return false;
        }

    }
    email.addEventListener( "keydown" , function(e) {
        if (emailEmpty || !inputKeyPressed(e as KeyboardEvent)) {
            return;
        }
        emailIndicator.setState(IndicatorStates.PROGRESS);
        updateFieldValidity("email", false);
    })

    email.addEventListener( "input", debounce(async function () {
        emailIndicator.setState(IndicatorStates.PROGRESS);

        emailMsg.setMsg("");
        updateFieldValidity("email", false);
        if (email.value.length <= 0) {
            emailIndicator.setState(IndicatorStates.HIDDEN);
            emailEmpty = true;
            return;
        }
        emailEmpty = false;
        
        const isValidEmail: boolean = await checkEmail(email.value);

        if (isValidEmail) {
            setTimeout(() => {
                emailIndicator.setState(IndicatorStates.ALLOW);
                updateFieldValidity("email", true);
            }, 250);
        } else {
            emailMsg.setMsg("Not valid email format");
            setTimeout(() => {
                emailIndicator.setState(IndicatorStates.DENY);
            }, 250);
        }

    }, 500)
    );

    username.addEventListener("input", debounce(function () {
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
        };
        usernameIndicator.setState(IndicatorStates.ALLOW);

        updateFieldValidity("username", true);
    }, 500));


    let updateStrength = debounce(function (strength: number) {
        if (passwordStrength) {
            removeClasses(passwordStrength, ["strength-1", "strength-2", "strength-3", "strength-4"]);
        }

        if (password.value.length > 0) {
            if (passwordStrength) passwordStrength.classList.add("strength-" + strength); 

            if (strength >= 4) {
                updateConfirm();
                updateFieldValidity("password", true);
                passwordIndicator.setState(IndicatorStates.HIDDEN);
                return;
            } 
        }
        passwordIndicator.setState(IndicatorStates.DENY);
    }, 250)

    password.addEventListener( "input" , () => {
        const passwordInput = password.value;
        updateFieldValidity("password", false);

        const validation = [
            (passwordInput.length > 8) ? 1: 0,
            (passwordInput.search(/[A-Z]/) > -1) ? 1 : 0,
            (passwordInput.search(/[0-9]/) > -1) ? 1: 0,
            (passwordInput.search(/[!@#$%^&*,;]/) > -1) ? 1: 0
        ]

        const strength = validatePassword(validation);
        updateStrength(strength);

        if (passwordChecklist) {
            for (let i = 0; i < validation.length; i++) {
                const li =passwordChecklist.children.item(i)!;
                if (validation[i]) {
                    li.classList.add("checked");
                } else {
                    li.classList.remove("checked");
                }
            }
        }
    });

    function updateConfirm() {
        confirmPasswordMsg.setMsg("");
        updateFieldValidity("password", false);
        if (!confirmPassword) {
            throw new Error("updateConfirm cannot be called without a #confirm-password-field");
        }
        if (confirmPassword.value.length <= 0) {
            confirmPasswordIndicator.setState(IndicatorStates.HIDDEN);
            return;
        } else  if (confirmPassword.value != password!.value) {
            confirmPasswordMsg.setMsg("Passwords do not match");
            confirmPasswordIndicator.setState(IndicatorStates.DENY);
            return;
        }

        updateFieldValidity("password", true);
        confirmPasswordIndicator.setState(IndicatorStates.ALLOW);
    }

    if (confirmPassword) {
        confirmPassword.addEventListener( "input" , debounce(updateConfirm, 500));
    }

    register.addEventListener("submit", async function (evt) {
        evt.preventDefault();
        const aFieldIsNotFilled = (!email.value || !username.value || !password.value || (confirmPassword ? !confirmPassword.value : false));
        if (aFieldIsNotFilled) {
            // TODO
            alert("Must fill in all fields");
            return;
        }
        const passwordDoNotMatch = (confirmPassword && password.value !== confirmPassword.value);
        if (passwordDoNotMatch) {
            // todo
            alert("passwords must match");
            return;
        }

        const data = new FormData(register);
        data.delete("confirm-password");

        try {
            const created = await postRequest("/accounts/create", data);

            if (created) {
                htmx.ajax("get", "/login", ".content");
            }
        } catch (e) {
            // TODO
        }
    });
}

export function checkSession() {
    let jwtToken = getCookie("jwt_token");

    if (!jwtToken) {
        htmx.ajax("get", "/login", ".content");
    }
}

async function postRequest(url: string, formData: FormData) {
    const request = new Request(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
            Object.fromEntries(formData.entries()),
        ),
    });
    const response = await fetch(request);

    if (response.ok) {
        return true;
    } else {
        throw new Error(`Response status: ${response.status}`);
    }
}
