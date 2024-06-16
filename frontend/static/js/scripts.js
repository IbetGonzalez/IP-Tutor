document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("dropdownBtn").addEventListener("click", toggleDropDown);
});

let toggleDropDown = debounce(() => {
    let dropDownMenu = document.getElementById("dropdownMenu");  
    let compStyle = window.getComputedStyle(dropDownMenu)
    let dropDownMenuActive = compStyle.display != "none";

    if (dropDownMenuActive) {
        dropDownMenu.style.display = "none";
    } else {
        dropDownMenu.style.display = "flex";
    }
}, 50);

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
