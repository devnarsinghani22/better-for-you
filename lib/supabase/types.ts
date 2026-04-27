export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string
          exclusion_reason: string | null
          id: number
          is_excluded: boolean
          name: string
          notes: string | null
          slug: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          exclusion_reason?: string | null
          id?: number
          is_excluded?: boolean
          name: string
          notes?: string | null
          slug: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          exclusion_reason?: string | null
          id?: number
          is_excluded?: boolean
          name?: string
          notes?: string | null
          slug?: string
          website_url?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          blurb: string | null
          created_at: string
          display_order: number
          id: number
          name: string
          serving_label: string | null
          serving_size_g: number | null
          slug: string
        }
        Insert: {
          active?: boolean
          blurb?: string | null
          created_at?: string
          display_order?: number
          id?: number
          name: string
          serving_label?: string | null
          serving_size_g?: number | null
          slug: string
        }
        Update: {
          active?: boolean
          blurb?: string | null
          created_at?: string
          display_order?: number
          id?: number
          name?: string
          serving_label?: string | null
          serving_size_g?: number | null
          slug?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          alt_buy_urls: Json | null
          brand_id: number
          category_id: number
          certification_method: Database["public"]["Enums"]["certification_method"]
          contains_flags: Json | null
          created_at: string
          description_md: string | null
          id: number
          ingredient_image_url: string | null
          ingredients_parsed: Json | null
          ingredients_raw: string | null
          label_image_url: string | null
          last_verified_at: string | null
          name: string
          nutrition: Json | null
          prepared_at: string | null
          prepared_by: string | null
          primary_buy_url: string | null
          product_photo_url: string | null
          rating: Database["public"]["Enums"]["product_rating"] | null
          retracted_at: string | null
          retraction_reason: string | null
          reverify_due_at: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
          variant_size: string | null
          verdict: string | null
        }
        Insert: {
          alt_buy_urls?: Json | null
          brand_id: number
          category_id: number
          certification_method?: Database["public"]["Enums"]["certification_method"]
          contains_flags?: Json | null
          created_at?: string
          description_md?: string | null
          id?: number
          ingredient_image_url?: string | null
          ingredients_parsed?: Json | null
          ingredients_raw?: string | null
          label_image_url?: string | null
          last_verified_at?: string | null
          name: string
          nutrition?: Json | null
          prepared_at?: string | null
          prepared_by?: string | null
          primary_buy_url?: string | null
          product_photo_url?: string | null
          rating?: Database["public"]["Enums"]["product_rating"] | null
          retracted_at?: string | null
          retraction_reason?: string | null
          reverify_due_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
          variant_size?: string | null
          verdict?: string | null
        }
        Update: {
          alt_buy_urls?: Json | null
          brand_id?: number
          category_id?: number
          certification_method?: Database["public"]["Enums"]["certification_method"]
          contains_flags?: Json | null
          created_at?: string
          description_md?: string | null
          id?: number
          ingredient_image_url?: string | null
          ingredients_parsed?: Json | null
          ingredients_raw?: string | null
          label_image_url?: string | null
          last_verified_at?: string | null
          name?: string
          nutrition?: Json | null
          prepared_at?: string | null
          prepared_by?: string | null
          primary_buy_url?: string | null
          product_photo_url?: string | null
          rating?: Database["public"]["Enums"]["product_rating"] | null
          retracted_at?: string | null
          retraction_reason?: string | null
          reverify_due_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
          variant_size?: string | null
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      certification_method: "label_tested" | "lab_tested" | "both"
      product_rating: "A+" | "A" | "B+" | "B" | "C" | "D"
      product_status:
        | "Draft"
        | "PendingReview"
        | "NeedsClarification"
        | "Approved"
        | "Rejected"
        | "Live"
        | "Retracted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      certification_method: ["label_tested", "lab_tested", "both"],
      product_rating: ["A+", "A", "B+", "B", "C", "D"],
      product_status: [
        "Draft",
        "PendingReview",
        "NeedsClarification",
        "Approved",
        "Rejected",
        "Live",
        "Retracted",
      ],
    },
  },
} as const
