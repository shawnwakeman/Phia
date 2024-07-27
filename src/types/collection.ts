import type { Database } from "./database.types";

export type Node = Database["public"]["Tables"]["nodes"]["Row"];

export type Issue = Database["public"]["Tables"]["issues"]["Row"];

export type Project = Database["public"]["Tables"]["projects"]["Row"];

export type ProjectUser = Database["public"]["Tables"]["project_users"]["Row"];

export type Blocks = Database["public"]["Tables"]["snapshots"]["Row"];

export type TargetStates = Database["public"]["Tables"]["node_target_states"]["Row"];


export type GridItemType = {
    id: string,
    x: number;
    y: number;
    w: number;
    h: number;
    min: { w: number, h: number };
    max: { w: number, h: number };
    type: ChartOptions;
};

export type ChartOptions = {
    type: string,
    windowName: string,
    header: string,
    querry: string ;
    description: string;
    min: { w: number, h: number };
    max: { w: number, h: number };
    isExpandable: boolean
}

export type UserSettings = {
    home: {
        grid: {
            gridLayout: GridItemType[],
            focusLayout: GridItemType[],
            usingSimple: boolean,
        }
    }
};

