document.addEventListener("DOMContentLoaded", function() {
    updateNav();
    
});
document.addEventListener("htmx:afterRequest", updateNav);

function updateNav() {
    let path = document.location.pathname.split("/")[1];

    let currSelNav = document.getElementsByClassName("nav-selected");
    
    let selNav = path ? document.getElementById(path) : document.getElementById("home");

    for (let i = 0; i < currSelNav.length; i++) {
        currSelNav.item(i).classList.remove("nav-selected");
    }
    selNav.classList.add("nav-selected");

}
