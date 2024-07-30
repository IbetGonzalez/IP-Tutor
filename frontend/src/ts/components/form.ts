import { Computed, Signal } from "@util/signal";
import { queryElement } from "@util/client-util";
import { removeClasses } from "@util/util";

export const InputStates = {
    VALID: 0,
    INVALID: 1,
    EMPTY: 2,
    CHECKING: 3
} as const

type State = {
    value: (typeof InputStates)[keyof typeof InputStates],
    msg: string;
};

export function createState(state: (typeof InputStates)[keyof typeof InputStates], msg=""): State {
    return {
        value: state,
        msg: msg,
    }
}

export class Form {
    private m_elem: HTMLFormElement;
    private m_fields: FormInput[];

    constructor(formQuery: string,fields: FormInput[]) {
        this.m_elem = queryElement(formQuery);
        this.m_fields = fields;
    }
    get checkReady() {
        let ready = true;
        for (let i = 0; i < this.m_fields.length; i++) {
            const currField = this.m_fields[i];
            if (currField.state.value !== InputStates.VALID) {
                ready = false;
                switch(currField.state.value) {
                    case InputStates.EMPTY:
                        currField.state = createState(InputStates.INVALID, "Field required");
                    break;
                    default:
                        currField.state = createState(InputStates.INVALID, "Invalid field");
                    break;
                }
            }
        }
        return ready;
    }
    get elem() {
        return this.m_elem;
    }
}

export class FormInput {
    private m_input = new Signal("");
    private m_state = new Signal<State>(createState(InputStates.EMPTY));
    private m_wrapperElem: HTMLDivElement;
    private m_inputElem: HTMLInputElement;

    constructor(inputWrapper: string) {
        this.m_wrapperElem= queryElement(inputWrapper);
        this.m_inputElem = queryElement(`${inputWrapper} input`);

        this.m_input.value = this.m_inputElem.value;

        this.m_inputElem.addEventListener('input', () => {
            this.m_input.value = this.m_inputElem.value;
        })
    }

    set state(state: State) {
        this.m_state.value = state;
    }
    get state() {
        return this.m_state.value;
    }

    get elem() {
        return this.m_inputElem;
    }

    get wrapper() {
        return this.m_wrapperElem;
    }

    get value() {
        return this.m_input.value;
    }
}

export enum IndicatorStates {
    HIDDEN = "hidden",
    PROGRESS = "progress",
    ALLOW = "allow",
    DENY = "deny",
}
export class MarkIndicator {
    indicator: HTMLElement | null;

    constructor(inputElem: HTMLElement) {
        this.indicator = inputElem.querySelector(".indicator svg");
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
        this.elem = elem.querySelector(".err-message");
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
