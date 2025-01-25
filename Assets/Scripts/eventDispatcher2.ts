
// eventDispatcher.ts
@component
export class EventDispatcher2 extends BaseScriptComponent {
    private listeners: { [event: string]: Function[] } = {};

    public on(event: string, callback: Function) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    public emit(event: string, ...args: any[]) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(...args));
        }
    }
}
