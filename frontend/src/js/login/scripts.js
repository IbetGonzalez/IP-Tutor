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
    const username = document.querySelector("#username-field");
    const password = document.querySelector("#password-field");
    const confirmPassword = document.querySelector("#confirm-password-field");

    email.addEventListener(
        "keyup",
        debounce(async function () {
            if (email.value) {
                try {
                    const data = new FormData();
                    data.append("username", "");
                    data.append("email", email.value);
                    data.append("password", "");

                    const request = new Request("/accounts/checkEmail", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(
                            Object.fromEntries(data.entries()),
                        ),
                    });
                    const response = await fetch(request);

                    if (response.ok) {
                        // TODO 
                    } else {
                        throw new Error(`Response status: ${response.status}`);
                    }
                } catch (e) {
                    // TODO
                    console.log(e.message);
                }
            }
        }, 500),
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
        try {
            const data = new FormData(register);
            data.delete("confirm-password");

            const JSONdata = Object.fromEntries(data.entries());

            const request = new Request("/accounts/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(JSONdata),
            });
            const response = await fetch(request);

            if (response.ok) {
                htmx.ajax("GET","/");
            } else {
                throw new Error(`Response status: ${response.status}`);
            }
        } catch (e) {
            console.log(e.message);
        }
    });
}

export function checkSession() {
    let jwtToken = getCookie("jwt_token");

    if (!jwtToken) {
        htmx.ajax("GET", "/login", ".content");
    }
}
