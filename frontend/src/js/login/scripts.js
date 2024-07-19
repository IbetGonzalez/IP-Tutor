import { getCookie, makeCookie } from './client.js';
import htmx from "htmx.org"

export function checkSession() {
    alert("it's working");
    let jwtToken = getCookie("jwt_token");

    if (!jwtToken) {
        htmx.ajax('GET', '/login', '.content');
    }
}


