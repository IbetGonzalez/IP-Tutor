export function makeCookie(c_name, c_value, expires_min) {
    const d = new Date();
    d.setTime(d.getTime() + (expires_min * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    const new_cookie = c_name + "=" + c_value + ";" + expires + ";path=/";
    return new_cookie;
} 
export function validatePassword (password) {
    const validation = [
        (password.length > 5),
        (password.search(/[A-Z]/) > -1),
        (password.search(/[0-9]/) > -1),
        (password.search(/[!@#$%^&*,;]/) > -1)
    ]
    return validation.reduce((acc, curr) => acc + curr);
}

export function getCookie(c_name){
    let name = c_name + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return ""
}
