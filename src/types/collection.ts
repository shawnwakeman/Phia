import type { Database } from "./database.types";

export type Node = Database["public"]["Tables"]["nodes"]["Row"];

export type Issue = Database["public"]["Tables"]["issues"]["Row"];

export type Config = Database["public"]["Tables"]["configurations"]["Row"];

export type User = Database["public"]["Tables"]["users"]["Row"];

export type Project = Database["public"]["Tables"]["projects"]["Row"];

export type ProjectUser = Database["public"]["Tables"]["project_users"]["Row"];

export type Blocks = Database["public"]["Tables"]["snapshots"]["Row"];

export type TargetStates = Database["public"]["Tables"]["node_target_states"]["Row"];