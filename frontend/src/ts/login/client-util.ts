export async function postRequest(url: string, formData: FormData) {
    const request = new Request(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const response = await fetch(request);

    return {
        status: response.status, 
        body: response.body
    };
}

export function validatePassword(validationRules: number[]) {
    return validationRules.reduce((acc, curr) => acc + curr);
}

export function makeCookie(c_name: string, c_value: string, expires_min: number) {
    const d = new Date();
    d.setTime(d.getTime() + expires_min * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    const new_cookie = c_name + "=" + c_value + ";" + expires + ";path=/";
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

