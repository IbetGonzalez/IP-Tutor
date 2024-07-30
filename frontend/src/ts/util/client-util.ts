type Header = {
    [key: string]: string,
}

export function queryElement<T extends HTMLElement>(selector: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) {
        throw new Error(`Could not find element: ${selector}`);
    }
    return element;
}

export const EmailStatus = {
    INVALID: 0,
    EXISTS: 1,
    AVAILABLE: 2,
    ERR: 3
} as const;
type emailStatus = (typeof EmailStatus)[keyof typeof EmailStatus]

export async function checkEmail(email: string): Promise<emailStatus> {
    const headers = [ { "Content-Type": "application/json" } ]
    const data = new FormData();
    data.append("email", email);

    const response = await postRequest("/accounts/checkEmail", headers, data);

    switch (response.status) {
        case 200:
            return EmailStatus.AVAILABLE;
        case 400:
            return EmailStatus.INVALID;
        case 409:
            return EmailStatus.EXISTS;
        default:
            return EmailStatus.ERR;
    }
}

export async function postRequest(url: string, headers: Header[],formData: FormData) {
    if (!headers) {
        console.error("No headers provided");
    }
    const requestHeaders = headers.reduce( (obj, item) => Object.assign(obj, { [item.name]: item.val }) );

    const request = new Request(url, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const response = await fetch(request);
    const responseJson = response.json();

    return {
        status: response.status, 
        body: responseJson
    };
}

export function validatePassword(validationRules: number[]) {
    return validationRules.reduce((acc, curr) => acc + curr);
}

export function makeCookie(c_name: string, c_value: string, expires_min: number) {
    const d = new Date();
    d.setTime(d.getTime() + expires_min * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    const new_cookie = c_name + "=" + c_value + ";" + expires + ";path=/;SameSite=strict";
    return new_cookie;
}
export function getCookie(c_name: string) {
    let name = c_name + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export function checkSession() {
    let jwtToken = getCookie("jwt_token");

    if (!jwtToken) {
        return false;
    }
    return true;
}
