
// eventDispatcher.ts
@component
export class EventDispatcher extends BaseScriptComponent {
    private listeners: { [event: string]: Function[] } = {};

    on(event: string, callback: Function) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event: string, ...args: any[]) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(...args));
        }
    }
}
