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
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: string
          body: string
          category: string
          cover: string
          cover_alt: string
          created_at: string
          cta_enabled: boolean
          cta_label: string
          cta_url: string
          date: string
          excerpt: string
          id: string
          read_time: string
          slug: string
          title: string
        }
        Insert: {
          author?: string
          body?: string
          category?: string
          cover?: string
          cover_alt?: string
          created_at?: string
          cta_enabled?: boolean
          cta_label?: string
          cta_url?: string
          date?: string
          excerpt?: string
          id?: string
          read_time?: string
          slug: string
          title: string
        }
        Update: {
          author?: string
          body?: string
          category?: string
          cover?: string
          cover_alt?: string
          created_at?: string
          cta_enabled?: boolean
          cta_label?: string
          cta_url?: string
          date?: string
          excerpt?: string
          id?: string
          read_time?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string
          service: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string
          name: string
          phone: string
          service?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          service?: string
        }
        Relationships: []
      }
      page_visits: {
        Row: {
          created_at: string
          id: string
          path: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean
          created_at: string
          id: string
          name: string
          quote: string
          rating: number
          role: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          id?: string
          name: string
          quote: string
          rating?: number
          role?: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          id?: string
          name?: string
          quote?: string
          rating?: number
          role?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          appearance: Json
          case_studies: Json
          contact: Json
          content: Json
          custom_pages: Json
          final_cta: Json
          home_blocks: Json
          home_faqs: Json
          home_membership: Json
          home_sections: Json
          id: number
          page_location: Json
          portfolio: Json
          section_groups: Json
          seo: Json
          service_faqs: Json
          service_previews: Json
          stats: Json
          trust_logos: Json
          updated_at: string
        }
        Insert: {
          appearance?: Json
          case_studies?: Json
          contact?: Json
          content?: Json
          custom_pages?: Json
          final_cta?: Json
          home_blocks?: Json
          home_faqs?: Json
          home_membership?: Json
          home_sections?: Json
          id?: number
          page_location?: Json
          portfolio?: Json
          section_groups?: Json
          seo?: Json
          service_faqs?: Json
          service_previews?: Json
          stats?: Json
          trust_logos?: Json
          updated_at?: string
        }
        Update: {
          appearance?: Json
          case_studies?: Json
          contact?: Json
          content?: Json
          custom_pages?: Json
          final_cta?: Json
          home_blocks?: Json
          home_faqs?: Json
          home_membership?: Json
          home_sections?: Json
          id?: number
          page_location?: Json
          portfolio?: Json
          section_groups?: Json
          seo?: Json
          service_faqs?: Json
          service_previews?: Json
          stats?: Json
          trust_logos?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      purge_old_leads: { Args: never; Returns: number }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
