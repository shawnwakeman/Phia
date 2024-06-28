import { type ClassValue } from 'clsx';
export declare const noop: () => void;
export declare function cn(...inputs: ClassValue[]): string;
export declare function isValidUrl(url: string): boolean;
export declare function getUrlFromString(str: string): string | null | undefined;
export declare function isBrowser(): boolean;
export declare function createDebouncedCallback<T extends (...args: any[]) => any>(callback: T, delay: number): (...args: Parameters<T>) => void;
export declare function anyify(obj: unknown): any;
