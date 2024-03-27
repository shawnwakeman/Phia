import type { Database } from "./database.types";

export type Node = Database["public"]["Tables"]["nodes"]["Row"];

export type FilePath = Database["public"]["Tables"]["node_files"]["Row"];

export type Issue = Database["public"]["Tables"]["issues"]["Row"];

export type Config = Database["public"]["Tables"]["configurations"]["Row"];