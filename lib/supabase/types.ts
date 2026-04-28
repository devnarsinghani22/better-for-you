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
      admin_users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          role: Database["public"]["Enums"]["admin_role"]
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_user_id: string | null
          created_at: string
          diff: Json | null
          from_status: Database["public"]["Enums"]["product_status"] | null
          id: number
          note: string | null
          product_id: number | null
          to_status: Database["public"]["Enums"]["product_status"] | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_user_id?: string | null
          created_at?: string
          diff?: Json | null
          from_status?: Database["public"]["Enums"]["product_status"] | null
          id?: number
          note?: string | null
          product_id?: number | null
          to_status?: Database["public"]["Enums"]["product_status"] | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_user_id?: string | null
          created_at?: string
          diff?: Json | null
          from_status?: Database["public"]["Enums"]["product_status"] | null
          id?: number
          note?: string | null
          product_id?: number | null
          to_status?: Database["public"]["Enums"]["product_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
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
          hero_image_url: string | null
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
          hero_image_url?: string | null
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
          hero_image_url?: string | null
          id?: number
          name?: string
          serving_label?: string | null
          serving_size_g?: number | null
          slug?: string
        }
        Relationships: []
      }
      category_rules: {
        Row: {
          active: boolean
          category_id: number | null
          code: string
          created_at: string
          description: string
          display_order: number
          evaluator_kind: string
          id: number
          is_required: boolean
          threshold_unit: string | null
          threshold_value: number | null
        }
        Insert: {
          active?: boolean
          category_id?: number | null
          code: string
          created_at?: string
          description: string
          display_order?: number
          evaluator_kind: string
          id?: number
          is_required?: boolean
          threshold_unit?: string | null
          threshold_value?: number | null
        }
        Update: {
          active?: boolean
          category_id?: number | null
          code?: string
          created_at?: string
          description?: string
          display_order?: number
          evaluator_kind?: string
          id?: number
          is_required?: boolean
          threshold_unit?: string | null
          threshold_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "category_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string | null
          id: number
          message: string
          name: string | null
          reason: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          message: string
          name?: string | null
          reason?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          message?: string
          name?: string | null
          reason?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      product_rule_results: {
        Row: {
          evaluated_at: string
          observed: Json | null
          passed: boolean
          product_id: number
          rule_id: number
        }
        Insert: {
          evaluated_at?: string
          observed?: Json | null
          passed: boolean
          product_id: number
          rule_id: number
        }
        Update: {
          evaluated_at?: string
          observed?: Json | null
          passed?: boolean
          product_id?: number
          rule_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_rule_results_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_rule_results_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "category_rules"
            referencedColumns: ["id"]
          },
        ]
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
          lab_report_url: string | null
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
          lab_report_url?: string | null
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
          lab_report_url?: string | null
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
      source_snapshots: {
        Row: {
          extracted_text: string | null
          hash_sha256: string | null
          id: number
          lab_report_url: string | null
          product_id: number | null
          raw_html_url: string | null
          retrieved_at: string
          screenshot_url: string | null
          source_domain: string | null
          source_url: string
        }
        Insert: {
          extracted_text?: string | null
          hash_sha256?: string | null
          id?: number
          lab_report_url?: string | null
          product_id?: number | null
          raw_html_url?: string | null
          retrieved_at?: string
          screenshot_url?: string | null
          source_domain?: string | null
          source_url: string
        }
        Update: {
          extracted_text?: string | null
          hash_sha256?: string | null
          id?: number
          lab_report_url?: string | null
          product_id?: number | null
          raw_html_url?: string | null
          retrieved_at?: string
          screenshot_url?: string | null
          source_domain?: string | null
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_snapshots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_role_for_email: {
        Args: { p_email: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
    }
    Enums: {
      admin_role: "preparer" | "reviewer"
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
      admin_role: ["preparer", "reviewer"],
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
