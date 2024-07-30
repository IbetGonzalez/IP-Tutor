import { createState, ErrMsg, Form, FormInput, IndicatorStates, InputStates, MarkIndicator } from "@components/form";
import { checkEmail, EmailStatus, getCookie, makeCookie, postRequest, validatePassword   } from "@util/client-util";
import { Computed, createEffect } from "@util/signal";
import { AlertColors, createAlert, debounce, removeClasses } from "@util/util";
import htmx from "htmx.org";

if (getCookie("jwt_token")) {
    htmx.ajax("get", "/settings", {
        target: ".content",
        headers: { "Authorization": `Bearer ${getCookie("jwt_token")}`}
    });
    history.pushState(null, "", "/settings")
}

const email = new FormInput("#email-wrapper");
const validateInput = debounce(
        async function (userInput: string) {
            const emailStatus = await checkEmail(userInput);

            switch (emailStatus) {
                case EmailStatus.EXISTS:
                    email.state = createState(InputStates.INVALID, "Account already associated with that email");
                break;
                case EmailStatus.AVAILABLE:
                    email.state = createState(InputStates.VALID);
                break;
                default:
                    email.state = createState(InputStates.INVALID, "Invalid format");
            }
        }
, 1000);

const manageEmailInput = createEffect(() => {
    const input = email.value;

    email.state = createState(InputStates.CHECKING, "");
    if (input.length < 1) {
        email.state = createState(InputStates.EMPTY);
        return;
    }
    validateInput(input);
});

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

const username = new FormInput("#username-wrapper");
const manageUsernameInput = createEffect(() => {
    const input = username.value;

    if (input.length < 1) {
        username.state = createState(InputStates.EMPTY);
        return;
    }

    if (input.search(/[^A-Za-z0-9&!_@\-.]/) > -1) {
        username.state = createState(InputStates.INVALID, "Username may only contain the following special characters: ! & @ _ - .");
        return;
    }
    username.state = createState(InputStates.VALID);
})
const manageUsernameState = createEffect(() => {
    const state = username.state;
    const indicator = new MarkIndicator(username.wrapper);
    const msg = new ErrMsg(username.wrapper);

    msg.setMsg(state.msg);
    switch(state.value) {
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

const password = new FormInput("#password-wrapper");
const passwordStrength = new Computed(() => {
    const input = password.value;
    const strengthChecklist: HTMLElement | null = password.wrapper.querySelector(".checklist");

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
        password.state = createState(InputStates.EMPTY);
        return 0;
    }
    return validatePassword(validation);
});

const manageStrength = createEffect(() => {
    const strength = passwordStrength.value;
    const strengthIndicator: HTMLElement | null = password.wrapper.querySelector(".strength");

    if (strengthIndicator) {
        removeClasses(strengthIndicator, ["strength-1", "strength-2", "strength-3", "strength-4"]);
        if (strength > 0) strengthIndicator.classList.add(`strength-${strength}`);

    }
    if (strength === 0) {
        password.state = createState(InputStates.EMPTY);
        return;
    }
    if (strength >= 4) {
        password.state = createState(InputStates.VALID);
        return;
    }
    password.state = createState(InputStates.INVALID);
});

const managePasswordStates = createEffect(() => {
    const state = password.state;
    const indicator = new MarkIndicator(password.wrapper);
    const msg = new ErrMsg(password.wrapper);

    msg.setMsg(state.msg);
    switch(state.value) {
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
const confirmPassword = new FormInput("#confirm-password-wrapper");

const confirmMatch = debounce((p1: string, p2: string) => {
    if (password.state.value !== InputStates.VALID) {
        confirmPassword.state = createState(InputStates.EMPTY);
        return;
    }
    if (p1.length === 0 || p2.length === 0 ) {
        confirmPassword.state = createState(InputStates.EMPTY);
        return;
    }
    if (p1 !== p2) {
        confirmPassword.state = createState(InputStates.INVALID, "Passwords do not match");
        return;
    }
    confirmPassword.state = createState(InputStates.VALID);
}, 500);

const passwordMatch = new Computed(() => {
    const passwordInput = password.value;
    const confirmPasswordInput = confirmPassword.value;

    confirmMatch(passwordInput, confirmPasswordInput);
});

const manageConfirmState = createEffect(() => {
    const state = confirmPassword.state;
    const indicator = new MarkIndicator(confirmPassword.wrapper);
    const msg = new ErrMsg(confirmPassword.wrapper);

    msg.setMsg(state.msg);
    switch(state.value) {
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

const registerForm = new Form("#register-form", [email, username, password, confirmPassword]);

registerForm.elem.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!registerForm.checkReady) return;

    const data = new FormData(registerForm.elem);
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
})








