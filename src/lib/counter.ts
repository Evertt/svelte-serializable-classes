import type { Writable } from "svelte/store"
import { writable, get } from "svelte/store"

export type CounterSerialized = { count: number }

export class Counter {
    #count: Writable<number>

    static serialize(instance: Counter): CounterSerialized {
        return { count: get(instance.#count) }
    }

    static unserialize(serialized: CounterSerialized): Counter {
        return new Counter(serialized.count)
    }

    get count() {
        return { subscribe: this.#count.subscribe }
    }

    increment(byAmount = 1) {
        this.#count.update(
            count => count + byAmount
        )
    }

    constructor(count: number = 0) {
        this.#count = writable(count)
    }

    toString() {
        return `class Counter { count: ${get(this.#count)} }`
    }
}
