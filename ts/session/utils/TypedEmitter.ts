// Code from https://github.com/andywer/typed-emitter

type Arguments<T> = [T] extends [(...args: infer U) => any] ? U : [T] extends [void] ? [] : [T];

/**
 * Type-safe event emitter.
 *
 * Use it like this:
 *
 * interface MyEvents {
 *   error: (error: Error) => void
 *   message: (from: string, content: string) => void
 * }
 *
 * const myEmitter = new EventEmitter() as TypedEmitter<MyEvents>
 *
 * myEmitter.on("message", (from, content) => {
 *   // ...
 * })
 *
 * myEmitter.emit("error", "x")  // <- Will catch this type error
 *
 * or
 *
 * class MyEmitter extends EventEmitter implements TypedEventEmitter<MyEvents>
 */
export interface TypedEventEmitter<Events> {
  addListener<E extends keyof Events>(event: E, listener: Events[E]): this;
  on<E extends keyof Events>(event: E, listener: Events[E]): this;
  once<E extends keyof Events>(event: E, listener: Events[E]): this;
  prependListener<E extends keyof Events>(event: E, listener: Events[E]): this;
  prependOnceListener<E extends keyof Events>(event: E, listener: Events[E]): this;

  off<E extends keyof Events>(event: E, listener: Events[E]): this;
  removeAllListeners<E extends keyof Events>(event?: E): this;
  removeListener<E extends keyof Events>(event: E, listener: Events[E]): this;

  emit<E extends keyof Events>(event: E, ...args: Arguments<Events[E]>): boolean;
  eventNames(): Array<keyof Events | string | symbol>;
  listeners<E extends keyof Events>(event: E): Array<Function>;
  listenerCount<E extends keyof Events>(event: E): number;

  getMaxListeners(): number;
  setMaxListeners(maxListeners: number): this;
}
