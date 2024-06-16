document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("dropdownBtn").addEventListener("click", toggleDropDown);
});

let toggleDropDown = debounce(() => {
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
