export let RUNNING: Effect | Computed | null = null;

export class Signal <T>{
    private _value: T;
    private dependencies: (Computed | Effect)[];

    constructor(val: T) {
        this._value = val;
        this.dependencies = [];
    }
    get value() {
        if (RUNNING) this.subscribe(RUNNING);
        return this._value;
    }
    set value(newValue: T) {
        if (this._value === newValue) return;
        this._value = newValue;
        this.notify();
    }
    subscribe(dep: Computed | Effect) {
        this.dependencies.push(dep);
    }
    notify() {
        this.dependencies.forEach((dep) => {
            dep.update();
        })
    }

}
function runAndSubscribe(task: Effect | Computed) {
    RUNNING = task;
    task.update();
    RUNNING = null;
}

export class Effect {
    private callBack: Function;

    constructor(callBack: Function) {
        this.callBack = callBack;
        runAndSubscribe(this);
    }

    update() {
        this.callBack();
    }
}

export class Computed {
    private _value: any;
    private calcFn: Function;
    private isStale: boolean;
    
    constructor(calcFn: Function) {
        this.calcFn = calcFn;
        this.isStale = true;
        runAndSubscribe(this);
    }

    get value() {
        if(this.isStale) {
            this._value = this.calcFn();
            this.isStale = false;
        }
        return this._value;
    }

    update() {
        this._value = this.calcFn();
        this.isStale = true;
    }
}
