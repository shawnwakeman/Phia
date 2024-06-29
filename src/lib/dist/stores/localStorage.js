import { isBrowser } from '../utils.js';
import { onDestroy } from 'svelte';
import { writable } from 'svelte/store';
export const createLocalStorageStore = (key, initialValue) => {
    const store = writable(initialValue);
    try {
        store.set(isBrowser() && localStorage.getItem(key)
            ? JSON.parse(localStorage.getItem(key))
            : initialValue);
    }
    catch (e) {
        // Do nothing
    }
    onDestroy(store.subscribe((v) => {
        if (!isBrowser())
            return;
        localStorage.setItem(key, JSON.stringify(v));
    }));
    return store;
};



