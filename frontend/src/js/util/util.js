export function debounce(func, wait) {
    let timeout;

    return function(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function removeClasses(elem, classArray) {
    classArray.forEach((cssClass) => {
        elem.classList.remove(cssClass);
    });
}

export function addClasses(elem, classArray) {
    classArray.forEach((cssClass) => {
        elem.classList.add(cssClass);
    });
}
export function inputKeyPressed(event) {
    const printableKeys = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};:'",.<>\/?\\|`~]$/;

    if (printableKeys.test(event.key)) {
        return true;
    } else {
        return false;
    }
}
