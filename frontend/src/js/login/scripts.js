import { validatePassword, getCookie, makeCookie } from "./client-util.js";
import { removeClasses, addClasses, inputKeyPressed, debounce } from "../util/util.js";

import htmx from "htmx.org";

const login = document.querySelector("#login-form");
if (login) {
    login.addEventListener("htmx:confirm", function (evt) {
        evt.preventDefault();
    });
}

const register = document.querySelector("#register-form");

if (register) {
    const email = document.querySelector("#email-field");
    const emailIndicator = document.querySelector("#email-field ~ .indicator svg");
    var emailEmpty = true;

    const username = document.querySelector("#username-field");

    const password = document.querySelector("#password-field");
    const passwordStrength = document.querySelector("#password-field ~ .strength");
    const passwordChecklist = document.querySelector("#password-field ~ .checklist");

    const confirmPassword = document.querySelector("#confirm-password-field");


    email.addEventListener( "keydown" , function(e) {
        if (emailEmpty || !inputKeyPressed(e)) {
            return;
        }

        removeClasses(emailIndicator, ["hidden", "deny", "allow"]);
        addClasses(emailIndicator, ["progress"]);
    })

    email.addEventListener( "input", debounce(async function () {
        if (email.value.length <= 0) {
            emailEmpty = true;
            removeClasses(emailIndicator, ["progress", "deny", "allow"]);
            emailIndicator.classList.add("hidden");
            return;
        }
        
        removeClasses(emailIndicator, ["hidden", "deny", "allow"]);
        addClasses(emailIndicator, ["progress"]);

        const data = new FormData();
        data.append("email", email.value);

        try {
            const available = await postRequest("/accounts/checkEmail", data);

            if (available) {
                setTimeout(() => {
                    emailIndicator.classList.remove("progress");
                    emailIndicator.classList.add("allow");
                }, 250);
            }
        } catch (e) {
            setTimeout(() => {
                emailIndicator.classList.remove("progress");
                emailIndicator.classList.add("deny");
            }, 250);
        }

        emailEmpty = false;
    }, 500)
    );

    let updateStrength = debounce(function (strength) {
        removeClasses(passwordStrength, ["strength-1", "strength-2", "strength-3", "strength-4"]);
        if (password.value.length <= 0) {
            return;
        }
        passwordStrength.classList.add("strength-" + strength);
    }, 250)

    password.addEventListener( "input" , () => {
        const passwordInput = password.value;
        const validation = [
            (passwordInput.length > 8),
            (passwordInput.search(/[A-Z]/) > -1),
            (passwordInput.search(/[0-9]/) > -1),
            (passwordInput.search(/[!@#$%^&*,;]/) > -1)
        ]

        const strength = validatePassword(validation, password.value);
        for (let i = 0; i < validation.length; i++) {
            const li =passwordChecklist.children.item(i)
            if (validation[i]) {
                li.classList.add("checked");
            } else {
                li.classList.remove("checked");
            }
        }

        updateStrength(strength);
    });

    register.addEventListener("submit", async function (evt) {
        evt.preventDefault();
        if (
            !email.value ||
            !username.value ||
            !password.value ||
            !confirmPassword.value
        ) {
            // TODO
            alert("Must fill in all fields");
            return;
        }
        if (password.value !== confirmPassword.value) {
            // TODO
            alert("Passwords must match");
            return;
        }

        const data = new FormData(register);
        data.delete("confirm-password");

        try {
            const created = await postRequest("/accounts/create", data);

            if (created) {
                htmx.ajax("GET", "/login", ".content");
            }
        } catch (e) {
            // TODO
        }
    });
}

export function checkSession() {
    let jwtToken = getCookie("jwt_token");

    if (!jwtToken) {
        htmx.ajax("GET", "/login", ".content");
    }
}

async function postRequest(url, formData) {
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
