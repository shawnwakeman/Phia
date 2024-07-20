import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import type { UserSettings } from "../types/collection";
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
    y?: number;
    x?: number;
    start?: number;
    duration?: number;
};

export const flyAndScale = (
    node: Element,
    params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;

    const scaleConversion = (
        valueA: number,
        scaleA: [number, number],
        scaleB: [number, number]
    ) => {
        const [minA, maxA] = scaleA;
        const [minB, maxB] = scaleB;

        const percentage = (valueA - minA) / (maxA - minA);
        const valueB = percentage * (maxB - minB) + minB;

        return valueB;
    };

    const styleToString = (
        style: Record<string, number | string | undefined>
    ): string => {
        return Object.keys(style).reduce((str, key) => {
            if (style[key] === undefined) return str;
            return str + `${key}:${style[key]};`;
        }, "");
    };

    return {
        duration: params.duration ?? 200,
        delay: 0,
        css: (t) => {
            const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
            const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
            const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

            return styleToString({
                transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
				
            });
        },
        easing: cubicOut
    };
};

export function get_color() {
	const hex_codes = [
		'#fca5a5',
		'#f87171',
		'#ef4444',
		'#fdba74',
		'#fb923c',
		'#f97316',
		'#fcd34d',
		'#fbbf24',
		'#f59e0b',
		'#fde047',
		'#facc15',
		'#eab308',
		'#bef264',
		'#a3e635',
		'#84cc16',
		'#86efac',
		'#4ade80',
		'#22c55e',
		'#6ee7b7',
		'#34d399',
		'#10b981',
		'#5eead4',
		'#2dd4bf',
		'#14b8a6',
		'#67e8f9',
		'#22d3ee',
		'#06b6d4',
		'#7dd3fc',
		'#38bdf8',
		'#0ea5e9',
		'#93c5fd',
		'#60a5fa',
		'#3b82f6',
		'#a5b4fc',
		'#818cf8',
		'#6366f1',
		'#c4b5fd',
		'#a78bfa',
		'#8b5cf6',
		'#d8b4fe',
		'#c084fc',
		'#a855f7',
		'#f0abfc',
		'#e879f9',
		'#d946ef',
		'#f9a8d4',
		'#f472b6',
		'#ec4899',
		'#fda4af',
		'#fb7185',
		'#f43f5e'
	];

	return hex_codes[Math.floor(Math.random() * hex_codes.length)];
}

export function get_name() {
	const names = [
		'Ada Lovelace',
		'Rick Astley',
		'John Doe',
		'Jane Doe',
		'Bill Sample',
		'Annie Example',
		'Eve Everywoman',
		'Adam Everyman',
		'Nina Nominee',
		'Mike Mockup',
		'Lisa Placeholder',
		'Tom Test',
		'Diana Default',
		'Pat Prototype',
		'Sammy Standard'
	];

	const random_index = Math.floor(Math.random() * names.length);
	return names[random_index];
}


export function mergeDefaults(
    userSettings: UserSettings,
    defaultSettings: UserSettings
): UserSettings {
    const merge = (userObj: any, defaultObj: any): any => {
        const result: any = {};

        // Add or merge properties from defaultObj
        for (const key in defaultObj) {
            if (defaultObj.hasOwnProperty(key)) {
                if (typeof defaultObj[key] === "object" && !Array.isArray(defaultObj[key])) {
                    result[key] = merge(userObj[key] || {}, defaultObj[key]);
                } else {
                    result[key] = userObj.hasOwnProperty(key) ? userObj[key] : defaultObj[key];
                }
            }
        }

        return result;
    };

    const result = merge(userSettings, defaultSettings);

    // Remove properties not present in defaultSettings
    const cleanUpUserSettings = (userObj: any, defaultObj: any) => {
        for (const key in userObj) {
            if (userObj.hasOwnProperty(key)) {
                if (!defaultObj.hasOwnProperty(key)) {
                    delete userObj[key];
                } else if (typeof userObj[key] === "object" && !Array.isArray(userObj[key])) {
                    cleanUpUserSettings(userObj[key], defaultObj[key]);
                }
            }
        }
    };

    cleanUpUserSettings(result, defaultSettings);

    return result;
}


export const defaultUserSettings: UserSettings = {
	home: {
		grid: {
			gridLayout: [],
			focusLayout: [],
			usingSimple: false,
		},
		
	},
};
