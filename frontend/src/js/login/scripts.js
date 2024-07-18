import { getCookie, makeCookie } from './client.js';

console.log("this is loading");
document.body.addEventListener("htmx:load", function() {
    let jwtToken = getCookie("jwt_token");
    if (jwtToken){
        console.log("Session, redirecting to settings");
        document.getElementById('settings').setAttribute('hx-get','/settings');
    } else {
        console.log("No session, redirecting to login");
        document.getElementById('settings').setAttribute('hx-get','/games');
    }
});
