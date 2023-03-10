type Events = {
    [key: string]: { listener: Function, once: boolean }[]
};

export class SimpleEmitter {

    private static _events: Events = {};

    static once(name: string, listener: Function) {
        if (!this._events[name]) {
            this._events[name] = [];
        }
        this._events[name].push({listener: listener, once: true});
    }

    static removeListener(name: string, listenerToRemove: Function) {
        if (!this._events[name]) {
            throw new Error(`Can't remove a listener. Event "${ name }" doesn't exist.`);
        }
        const filterListeners = (value: { listener: Function, once: boolean }) => value.listener !== listenerToRemove;
        this._events[name] = this._events[name].filter(filterListeners);
    }

    static oncePromise(name: string, timeout = 15000) {
        return new Promise((resolve, reject) => {
            let timeoutListener: NodeJS.Timeout|null = null; // In order to clear the timeout once resolved
            const listener = (...data: any[]) => {
                if (timeoutListener != null)
                    clearTimeout(timeoutListener);
                resolve(data);
            }
            this.once(name, listener);
            timeoutListener = setTimeout(() => {
                this.removeListener(name, listener);
                reject('timeout');
            }, timeout);
        })
    }

    static emit(name: keyof Events, ...data: any) {
        if (!this._events[name]) {
            throw new Error("This event doesn't exist.");
        }
        this._events[name].forEach((value) => {
            if (value.once) {
                this._events[name].splice(this._events[name].indexOf(value), 1);
            }
            value.listener(...data);
        });
    }
}
