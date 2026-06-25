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
      artists: {
        Row: {
          bio: string | null
          created_at: string
          experience_years: number | null
          id: string
          is_active: boolean
          languages: string[] | null
          name: string
          photo_url: string | null
          salon_id: string
          specialty: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          is_active?: boolean
          languages?: string[] | null
          name: string
          photo_url?: string | null
          salon_id: string
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          is_active?: boolean
          languages?: string[] | null
          name?: string
          photo_url?: string | null
          salon_id?: string
          specialty?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artists_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount_paid: number | null
          artist_id: string | null
          booking_date: string
          booking_type: string
          cancellation_reason: string | null
          created_at: string
          customer_id: string
          end_time: string
          id: string
          notes: string | null
          package_id: string | null
          payment_status: string
          salon_id: string
          start_time: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          artist_id?: string | null
          booking_date: string
          booking_type?: string
          cancellation_reason?: string | null
          created_at?: string
          customer_id: string
          end_time: string
          id?: string
          notes?: string | null
          package_id?: string | null
          payment_status?: string
          salon_id: string
          start_time: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          artist_id?: string | null
          booking_date?: string
          booking_type?: string
          cancellation_reason?: string | null
          created_at?: string
          customer_id?: string
          end_time?: string
          id?: string
          notes?: string | null
          package_id?: string | null
          payment_status?: string
          salon_id?: string
          start_time?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          description: string | null
          discounted_price: number | null
          duration_days: number
          id: string
          is_active: boolean
          name: string
          original_price: number
          salon_id: string
          services_included: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          duration_days?: number
          id?: string
          is_active?: boolean
          name: string
          original_price?: number
          salon_id: string
          services_included?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          duration_days?: number
          id?: string
          is_active?: boolean
          name?: string
          original_price?: number
          salon_id?: string
          services_included?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packages_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_images: {
        Row: {
          category: string | null
          created_at: string
          id: string
          image_url: string
          is_featured: boolean
          salon_id: string
          title: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_featured?: boolean
          salon_id: string
          title?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_featured?: boolean
          salon_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          phone: string | null
          role: string
          skin_tone: string | null
          updated_at: string
          wedding_date: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
          phone?: string | null
          role?: string
          skin_tone?: string | null
          updated_at?: string
          wedding_date?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          role?: string
          skin_tone?: string | null
          updated_at?: string
          wedding_date?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          is_flagged: boolean | null
          rating: number
          salon_id: string
          salon_reply: string | null
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_flagged?: boolean | null
          rating: number
          salon_id: string
          salon_reply?: string | null
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_flagged?: boolean | null
          rating?: number
          salon_id?: string
          salon_reply?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salons: {
        Row: {
          amenities: Json | null
          area: string | null
          city: string
          cover_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          owner_id: string
          phone: string | null
          pincode: string | null
          slug: string
          state: string
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          amenities?: Json | null
          area?: string | null
          city?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          owner_id: string
          phone?: string | null
          pincode?: string | null
          slug: string
          state?: string
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          amenities?: Json | null
          area?: string | null
          city?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          owner_id?: string
          phone?: string | null
          pincode?: string | null
          slug?: string
          state?: string
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salons_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_looks: {
        Row: {
          color_scheme: string | null
          created_at: string | null
          features: string[] | null
          id: string
          image_url: string
          makeup_description: string | null
          source_photo_url: string | null
          style: string
          user_id: string
        }
        Insert: {
          color_scheme?: string | null
          created_at?: string | null
          features?: string[] | null
          id?: string
          image_url: string
          makeup_description?: string | null
          source_photo_url?: string | null
          style: string
          user_id: string
        }
        Update: {
          color_scheme?: string | null
          created_at?: string | null
          features?: string[] | null
          id?: string
          image_url?: string
          makeup_description?: string | null
          source_photo_url?: string | null
          style?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_looks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          price: number
          salon_id: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name: string
          price?: number
          salon_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          salon_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      time_slots: {
        Row: {
          booking_id: string | null
          created_at: string
          date: string
          end_time: string
          id: string
          is_booked: boolean
          salon_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          date: string
          end_time: string
          id?: string
          is_booked?: boolean
          salon_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          is_booked?: boolean
          salon_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_slots_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      working_hours: {
        Row: {
          close_time: string | null
          created_at: string
          day_of_week: number
          id: string
          is_closed: boolean
          open_time: string | null
          salon_id: string
          updated_at: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          day_of_week: number
          id?: string
          is_closed?: boolean
          open_time?: string | null
          salon_id: string
          updated_at?: string
        }
        Update: {
          close_time?: string | null
          created_at?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean
          open_time?: string | null
          salon_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_salon_stats: {
        Args: { p_salon_id: string }
        Returns: {
          avg_rating: number
          review_count: number
          starting_price: number
        }[]
      }
      get_salon_booking_counts: {
        Args: Record<string, never>
        Returns: {
          salon_id: string
          booking_count: number
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

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
export type Functions<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T]
