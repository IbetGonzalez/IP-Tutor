import { validatePassword, getCookie } from "./client-util";
import { removeClasses, addClasses, inputKeyPressed, debounce } from "../util/util";
import htmx from "htmx.org";

const login = document.querySelector("#login-form");
if (login) {
    login.addEventListener("htmx:confirm", function (evt) {
        evt.preventDefault();
    });
}

const register: HTMLFormElement | null = document.querySelector("#register-form");

if (register) {
    const email: HTMLInputElement | null = document.querySelector("#email-field");
    if (!email) {
        throw new Error(`No email input-field, expecting #email-field.`);
    }
    const emailIndicator = document.querySelector("#email-field ~ .indicator svg");
    var emailEmpty = true;

    const username: HTMLInputElement | null = document.querySelector("#username-field");
    if (!username) {
        throw new Error(`No username input-field, expecting #username-field.`);
    }

    const password: HTMLInputElement | null = document.querySelector("#password-field");
    if (!password) {
        throw new Error(`No password input-field, expecting #password-field.`);
    }
    const passwordIndicator = document.querySelector("#password-field ~ .indicator svg");
    const passwordStrength = document.querySelector("#password-field ~ .strength");
    const passwordChecklist = document.querySelector("#password-field ~ .checklist");

    const confirmPassword: HTMLInputElement | null = document.querySelector("#confirm-password-field");
    const confirmPasswordIndicator = document.querySelector("#confirm-password-field ~ .indicator svg");

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


    email.addEventListener( "keydown" , function(e) {
        if (emailEmpty || !inputKeyPressed(e as KeyboardEvent)) {
            return;
        }
        if (emailIndicator) {
            removeClasses(emailIndicator, ["hidden", "deny", "allow"]);
            addClasses(emailIndicator, ["progress"]);
        }
        updateFieldValidity("email", false);
    })

    email.addEventListener( "input", debounce(async function () {
        if (emailIndicator) {
            removeClasses(emailIndicator, ["hidden", "deny", "allow"]);
            addClasses(emailIndicator, ["progress"]);
        }

        updateFieldValidity("email", false);
        if (email.value.length <= 0) {
            if (emailIndicator) {
                emailIndicator.classList.add("hidden");
            }
            emailEmpty = true;
            return;
        }
        

        const data = new FormData();
        data.append("email", email.value);

        try {
            const available = await postRequest("/accounts/checkEmail", data);

            if (available) {
                setTimeout(() => {
                    if (emailIndicator) {
                        emailIndicator.classList.remove("progress");
                        emailIndicator.classList.add("allow");
                    }
                    updateFieldValidity("email", true);
                }, 250);
            }
        } catch (e) {
            setTimeout(() => {
                if (emailIndicator) {
                    emailIndicator.classList.remove("progress");
                    emailIndicator.classList.add("deny");
                }
            }, 250);
        }

        emailEmpty = false;
    }, 500)
    );

    let updateStrength = debounce(function (strength: number) {
        if (passwordStrength) {
            removeClasses(passwordStrength, ["strength-1", "strength-2", "strength-3", "strength-4"]);
        }

        if (password.value.length > 0) {
            if (passwordStrength) { passwordStrength.classList.add("strength-" + strength); }

            if (strength >= 4) {
                updateConfirm();
                updateFieldValidity("password", true);
                if (passwordIndicator) {
                    passwordIndicator.classList.remove("deny");
                    passwordIndicator.classList.add("hidden");
                }
                return;
            } 
        }
        
        if (passwordIndicator) {
            passwordIndicator.classList.add("deny");
            passwordIndicator.classList.remove("hidden");
        }
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

        updateStrength(strength);
    });

    function updateConfirm() {
        if (!confirmPassword) {
            throw new Error("updateConfirm cannot be called without a #confirm-password-field");
        }
        if (confirmPasswordIndicator) {
            removeClasses(confirmPasswordIndicator, ["hidden", "deny", "allow"]);
        }
        updateFieldValidity("password", false);
        if (confirmPassword.value.length <= 0) {
            if (confirmPasswordIndicator) confirmPasswordIndicator.classList.add("hidden");
            return;
        }

        if (confirmPassword.value != password!.value) {
            if (confirmPasswordIndicator) confirmPasswordIndicator.classList.add("deny");
            return;
        }

        updateFieldValidity("password", true);
        if (confirmPasswordIndicator) confirmPasswordIndicator.classList.add("allow");
    }

    if (confirmPassword) {
        confirmPassword.addEventListener( "input" , debounce(updateConfirm, 500));
    }

    register.addEventListener("submit", async function (evt) {
        evt.preventDefault();
        const aFieldIsNotFilled = (!email.value || !username.value || !password.value || (confirmPassword ? confirmPassword.value : false));
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
