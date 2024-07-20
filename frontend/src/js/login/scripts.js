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
var empty = true;

function symbolKeyPressed(event) {
    const printableKeys = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};:'",.<>\/?\\|`~]$/;

    if (printableKeys.test(event.key)) {
        return true;
    } else {
        return false;
    }
}
if (register) {
    const email = document.querySelector("#email-field");
    const emailIndcicator = document.querySelector("#email-field ~ .indicator svg");
    const username = document.querySelector("#username-field");
    const password = document.querySelector("#password-field");
    const confirmPassword = document.querySelector("#confirm-password-field");


    email.addEventListener("keydown", function(e) {
        if (empty || !symbolKeyPressed(e)) {
            return;
        }
        emailIndcicator.classList.remove("hidden");
        emailIndcicator.classList.remove("deny");
        emailIndcicator.classList.remove("allow");
        emailIndcicator.classList.add("progress");
    })

    email.addEventListener( "keyup", debounce(async function (e) {
        if (!symbolKeyPressed(e) && !e.shiftKey) {
            return;
        }
        if (email.value !== "") {
            emailIndcicator.classList.remove("hidden");
            emailIndcicator.classList.remove("deny");
            emailIndcicator.classList.remove("allow");
            emailIndcicator.classList.add("progress");

            const data = new FormData();
            data.append("username", "");
            data.append("email", email.value);
            data.append("password", "");

            try {
                const available = await postRequest("/accounts/checkEmail", data);

                if (available) {
                    setTimeout(() => {
                        emailIndcicator.classList.remove("progress");
                        emailIndcicator.classList.add("allow");
                    }, 250);
                }
            } catch (e) {
                setTimeout(() => {
                    emailIndcicator.classList.remove("progress");
                    emailIndcicator.classList.add("deny");
                }, 250);
            }
            empty = false;
        } else {
            empty = true;
            emailIndcicator.classList.remove("deny");
            emailIndcicator.classList.remove("allow");
            emailIndcicator.classList.remove("progress");
            emailIndcicator.classList.add("hidden");
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
