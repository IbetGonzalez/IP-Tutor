
export enum AlertColors {
    WARNING = "bg-warning",
    SUCCESS = "bg-success",
    INFO = "bg-info",
    SECONDARY = "bg-secondary"
}
export function createAlert(msg: string, timeMs: number, color: AlertColors) {
    const alertNode = document.createElement("div");
    alertNode.classList.add("alert-box");
    alertNode.classList.add(color);
    alertNode.innerText = msg;
    document.body.appendChild(alertNode);

    setTimeout(function () {
        alertNode.remove()
    }, timeMs);
}

export function queryElement<T extends HTMLElement>(selector: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) {
        throw new Error(`Could not find element: ${selector}`);
    }
    return element;
}
export function debounce(func: Function, waitMs: number) {
    let timeout: ReturnType<typeof setTimeout>;

    return function (this: any, ...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, waitMs);
    };
}

export function removeClasses(elem: HTMLElement, classArray: string[]) {
    classArray.forEach((cssClass) => {
        elem.classList.remove(cssClass);
    });
}

export function addClasses(elem: HTMLElement, classArray: string[]) {
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
