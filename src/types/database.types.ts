// supabase gen types typescript --project-id bymhrlzlmvnwyhoatzjx --schema public > database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      configurations: {
        Row: {
          config_key: string
          config_value: Json
          id: number
        }
        Insert: {
          config_key: string
          config_value: Json
          id?: number
        }
        Update: {
          config_key?: string
          config_value?: Json
          id?: number
        }
        Relationships: []
      }
      issues: {
        Row: {
          columnIndex: number | null
          created_at: string
          customcolumns: Json | null
          description: string
          id: number
          name: string
          node_id: number | null
          priority: string | null
          state: string | null
        }
        Insert: {
          columnIndex?: number | null
          created_at?: string
          customcolumns?: Json | null
          description: string
          id?: number
          name: string
          node_id?: number | null
          priority?: string | null
          state?: string | null
        }
        Update: {
          columnIndex?: number | null
          created_at?: string
          customcolumns?: Json | null
          description?: string
          id?: number
          name?: string
          node_id?: number | null
          priority?: string | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_issues_node"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      node_files: {
        Row: {
          file_id: number
          iscanvas: boolean | null
          node_id: number
        }
        Insert: {
          file_id: number
          iscanvas?: boolean | null
          node_id: number
        }
        Update: {
          file_id?: number
          iscanvas?: boolean | null
          node_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_node_files_node"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      nodes: {
        Row: {
          id: number
          name: string
          parent_id: number | null
          value: number
        }
        Insert: {
          id?: number
          name: string
          parent_id?: number | null
          value: number
        }
        Update: {
          id?: number
          name?: string
          parent_id?: number | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_nodes_parent"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_nested_issues: {
        Args: {
          node_id: number
        }
        Returns: {
          columnIndex: number | null
          created_at: string
          customcolumns: Json | null
          description: string
          id: number
          name: string
          node_id: number | null
          priority: string | null
          state: string | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
