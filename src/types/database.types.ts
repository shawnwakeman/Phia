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
          config_value: string
          id: number
        }
        Insert: {
          config_key: string
          config_value: string
          id?: number
        }
        Update: {
          config_key?: string
          config_value?: string
          id?: number
        }
        Relationships: []
      }
      issues: {
        Row: {
          created_at: string
          customcolumns: Json | null
          description: string
          id: number
          node_id: number | null
          priority: string | null
          project_id: number
          state: string | null
          title: string
        }
        Insert: {
          created_at?: string
          customcolumns?: Json | null
          description: string
          id?: number
          node_id?: number | null
          priority?: string | null
          project_id: number
          state?: string | null
          title: string
        }
        Update: {
          created_at?: string
          customcolumns?: Json | null
          description?: string
          id?: number
          node_id?: number | null
          priority?: string | null
          project_id?: number
          state?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_issues_node"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_issues_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      nodes: {
        Row: {
          id: number
          name: string
          parent_id: number | null
          project_id: number
          state: string | null
          value: number
        }
        Insert: {
          id?: number
          name: string
          parent_id?: number | null
          project_id: number
          state?: string | null
          value: number
        }
        Update: {
          id?: number
          name?: string
          parent_id?: number | null
          project_id?: number
          state?: string | null
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
          {
            foreignKeyName: "fk_nodes_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      project_users: {
        Row: {
          project_id: number
          project_user_id: number
          role: string | null
          user_id: number
        }
        Insert: {
          project_id: number
          project_user_id?: number
          role?: string | null
          user_id: number
        }
        Update: {
          project_id?: number
          project_user_id?: number
          role?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_users_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_project_users_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      projects: {
        Row: {
          creator_id: number | null
          description: string | null
          project_id: number
          project_name: string
        }
        Insert: {
          creator_id?: number | null
          description?: string | null
          project_id?: number
          project_name: string
        }
        Update: {
          creator_id?: number | null
          description?: string | null
          project_id?: number
          project_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_projects_creator"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          email: string
          name: string | null
          user_id: number
        }
        Insert: {
          email: string
          name?: string | null
          user_id?: number
        }
        Update: {
          email?: string
          name?: string | null
          user_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
