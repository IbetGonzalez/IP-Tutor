export enum IndicatorStates {
    HIDDEN = "hidden",
    PROGRESS = "progress",
    ALLOW = "allow",
    DENY = "deny" 
}
export class MarkIndicator{
    indicator: HTMLElement | null;

    constructor(inputElem: HTMLElement) {
        const parent = inputElem.parentElement;

        if (!parent) {
            console.warn("Indicator element must be contained in the same tag as input element");
            this.indicator = null;
            return;
        }
        this.indicator = parent.querySelector(".indicator svg");

    }
    setState(state: IndicatorStates) {
        if (!this.indicator) {
            console.warn("Cannot call setState on an invalid indicator");
            return;
        }
        removeClasses(this.indicator, ["hidden", "progress", "allow", "deny"]);
        this.indicator.classList.add(state);
    }
}
export class ErrMsg {
    elem: HTMLElement | null;

    constructor(elem: HTMLElement) {
        this.elem = elem.parentElement!.querySelector(".err-message");
        if (!this.elem) {
            console.error("No error message indicator in input-field");
        }
    }
    setMsg(msg: string) {
        if (!this.elem) {
            console.error("No error message indicator in input-field");
            return;
        }
        this.elem.innerText = msg;
    }


}
export function queryElement<T extends HTMLElement>(selector: string,): T {
    const element = document.querySelector<T>(selector);
    if (!element) {
        throw new Error(`Could not find element: ${selector}`);
    }
    return element;
}
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
