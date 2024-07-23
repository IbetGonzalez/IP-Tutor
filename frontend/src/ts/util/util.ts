export function debounce(func: Function, waitMs: number) {
    let timeout: ReturnType<typeof setTimeout>;

    return function(this: any,...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, waitMs);
    };
}

export function removeClasses(elem: Element, classArray: string[]) {
    classArray.forEach((cssClass) => {
        elem.classList.remove(cssClass);
    });
}

export function addClasses(elem: Element, classArray: string[]) {
    classArray.forEach((cssClass) => {
        elem.classList.add(cssClass);
    });
}
export function inputKeyPressed(event: KeyboardEvent) {
    const printableKeys = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};:'",.<>\/?\\|`~]$/;

    if (printableKeys.test(event.key)) {
        return true;
    } else {
        return false;
    }
}
