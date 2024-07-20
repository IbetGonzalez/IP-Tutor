import { getCookie, makeCookie } from "./client.js";
import { debounce } from "../scripts.js";

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
    const emailIndcicator = document.querySelector("#email-field ~ .indicator svg");
    const username = document.querySelector("#username-field");
    const password = document.querySelector("#password-field");
    const confirmPassword = document.querySelector("#confirm-password-field");

    email.addEventListener( "keyup", debounce(async function () {
        if (email.value) {
            emailIndcicator.classList.remove("hidden");
            emailIndcicator.classList.add("progress");

            const data = new FormData();
            data.append("username", "");
            data.append("email", email.value);
            data.append("password", "");

            if (!postRequest(data)) {
                emailIndcicator.classList.remove("progress");
                emailIndcicator.classList.add("tick");
            } else {
                alert("Oh no else!");
            }
        }
    }, 500)
    );

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

        if (postRequest(data)) {
            htmx.ajax("GET", "/login", ".content");
        } else {
            // TODO:  Could not create account
        }
    });
}

export function checkSession() {
    let jwtToken = getCookie("jwt_token");

    if (!jwtToken) {
        htmx.ajax("GET", "/login", ".content");
    }
}

async function postRequest(formData) {
    try {
        const request = new Request("/accounts/checkEmail", {
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
    } catch (e) {
        return false;
    }
}
