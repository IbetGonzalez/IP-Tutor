document.addEventListener("DOMContentLoaded", function() {
    //document.getElementById("dropdownBtn").addEventListener("click", toggleDropDown);
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
    console.log(selNav);
    selNav.classList.add("nav-selected");

}

var toggleDropDown = debounce(() => {
    let dropdownMenu = document.getElementById("dropdownMenu");  
    let dropdownBtn = document.getElementById("dropdownBtn")

    dropdownMenu.classList.toggle("active");
    dropdownBtn.classList.add("pressed");
    window.setTimeout(() => {
        dropdownBtn.classList.remove("pressed");
    }, 100)

}, 1);

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
