import { getCookie } from "@util/client-util";
import htmx from "htmx.org";

if (getCookie("jwt_token")) {
    const path = document.location.pathname;
    htmx.ajax("get", document.location.pathname, ".content");
} else {
    htmx.ajax("get", "/login", ".content");
    history.pushState({}, "", "/login");
}
