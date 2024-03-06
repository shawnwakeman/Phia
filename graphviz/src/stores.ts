// src/stores.ts
import { writable } from 'svelte/store';
import type { HierarchyCircularNode } from 'd3';

// Assuming WrittableNode is imported or defined here as well


export const selectedNodeId = writable<number>(1);