import { createEffect } from "@util/signal";
import { 
    FormInput, 
    InputStates,
    ErrMsg,
    IndicatorStates,
    MarkIndicator, 
    createState,
    Form
} from "@components/form";

import { checkEmail, EmailStatus, getCookie, makeCookie, postRequest   } from "@util/client-util";
import {  AlertColors, createAlert, debounce  } from "@util/util";
import htmx from "htmx.org";

if (getCookie("jwt_token")) {
    htmx.ajax("get", "/settings", {
        target: ".content",
        headers: { "Authorization": `Bearer ${getCookie("jwt_token")}`}
    });
    history.pushState(null, "", "/settings")
}

const email = new FormInput("#email-wrapper");
const password = new FormInput("#password-wrapper");

const loginForm = new Form("#login-form", [email, password]);

loginForm.elem.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!loginForm.checkReady) {
        return;
    }
    const data = new FormData(loginForm.elem);
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
            password.state = createState(InputStates.INVALID, "Incorrect passsword");
            createAlert("Incorrect password", 5000, AlertColors.WARNING);
    }
});

const validateInput = debounce(
    async function (userInput: string) {
        const emailStatus = await checkEmail(userInput);

        switch (emailStatus) {
            case EmailStatus.EXISTS:
                email.state = createState(InputStates.VALID);
            break;
            default:
                email.state = createState(InputStates.INVALID, "No account found");
            break;
        }
    }
, 1000);

/* 
*   manageEmailInput is an effect that run anytime "email.value" is updated
*   based on length and validity of the email it updates the state of the email field
*/
const managEmailInput = createEffect(() => {
    const userInput = email.value;

    email.state = createState(InputStates.CHECKING, "");
    if (userInput.length < 1) {
        email.state = createState(InputStates.EMPTY);
        return;
    }
    validateInput(userInput);
});
/* 
*   manageEmailState is run when the states is updated
*   defines the states how how they should be visually represented
*   
*/
const manageEmailState = createEffect(() => {
    const state = email.state;
    const indicator = new MarkIndicator(email.wrapper);
    const msg = new ErrMsg(email.wrapper);

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

const managePasswordInput = createEffect(() => {
    const userInput = password.value;

    if (userInput.length < 1) {
        password.state = createState(InputStates.EMPTY);
        return
    }
    password.state = createState(InputStates.VALID);
});

const managePasswordState = createEffect(() => {
    const state = password.state;
    const indicator = new MarkIndicator(password.wrapper);
    const msg = new ErrMsg(password.wrapper);

    msg.setMsg(state.msg);
    switch(state.value) {
        case InputStates.INVALID:
            indicator.setState(IndicatorStates.DENY);
        break;
        default:
            indicator.setState(IndicatorStates.HIDDEN);
    }
});
