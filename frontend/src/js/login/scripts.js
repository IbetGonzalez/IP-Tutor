import { getCookie, makeCookie } from './client.js';
import { debounce } from '../scripts.js';
import htmx from "htmx.org"

const login = document.querySelector("#login-form");
if (login) {
    login.addEventListener("htmx:confirm", function (evt) {
        alert("NOT SENDING");
        evt.preventDefault();
    });
}

const register = document.querySelector("#register-form");
if (register) {
    const email = document.querySelector("#email-field");
    const username = document.querySelector("#username-field");
    const password = document.querySelector("#password-field");
    const confirmPassword = document.querySelector("#confirm-password-field");

    email.addEventListener("keyup", debounce(async function() {
        if (email.value) {
            try {
                const request = new Request(
                    "/accounts/checkEmail",
                    { 
                        method: "POST",
                        headers: { "Content-Type": "application/json", },
                        body: JSON.stringify({ username: "", email: email.text, password: "" }),
                    },
                        
                );
                const response = await fetch(request);
                if (response.ok) {
                    console.log("the response was", response);
                } else {
                    throw new Error(`Response status: ${response.status}`)
                }
            } catch (e) {
                console.log(e.message);
            }
        }

    }, 500))

    register.addEventListener("htmx:confirm", function (evt) {
        evt.preventDefault();

        if (!email.value || !username.value || !password.value || !confirmPassword.value) {
            alert("Must fill in all fields");
            return;
        }
        if (password.value !== confirmPassword.value) {
            alert("Passwords must match");
            return;
        }
        alert(evt.detail.xhr);

        evt.detail.issueRequest();
    });
    register.addEventListener("htmx:configRequest", function(evt){
        delete evt.detail.parameters["confirm-password"];
        evt.detail.headers["Content-Type"] = "application/json";
    })

    register.addEventListener("htmx:afterRequest", function(evt) {
        const status = evt.detail.successful;
        if (status) {
            alert("Everything went well");
            return;
        }
        alert(evt.detail.xhr.status);

    })
}

export function checkSession() {
    alert("it's working");
    let jwtToken = getCookie("jwt_token");

    if (!jwtToken) {
        htmx.ajax('GET', '/login', '.content');
    }
}


