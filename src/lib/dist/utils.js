import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const noop = () => {
    // do nothing
};
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch (e) {
        return false;
    }
}
export function getUrlFromString(str) {
    if (isValidUrl(str))
        return str;
    try {
        if (str.includes('.') && !str.includes(' ')) {
            return new URL(`https://${str}`).toString();
        }
    }
    catch (e) {
        return null;
    }
}
export function isBrowser() {
    return typeof window !== 'undefined';
}
export function createDebouncedCallback(callback, delay) {
    let timeout = null;
    return (...args) => {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(() => callback(...args), delay);
    };
}
export function anyify(obj) {
    return obj;
}
