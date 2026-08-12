// Hand-written to match supabase/migrations/0001_init_core.sql and 0002_rls_policies.sql.
// Once the Supabase project exists, regenerate with:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts
// and re-add the convenience aliases at the bottom.

export type TaskStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Completed'
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical'
export type RoleId = 'admin' | 'organiser' | 'restricted'

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: { id: RoleId; label: string; description: string | null }
        Insert: { id: RoleId; label: string; description?: string | null }
        Update: { id?: RoleId; label?: string; description?: string | null }
        Relationships: []
      }
      weddings: {
        Row: {
          id: string
          name: string
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          start_date?: string | null
          end_date?: string | null
        }
        Update: Partial<Database['public']['Tables']['weddings']['Insert']>
        Relationships: []
      }
      events: {
        Row: {
          id: string
          wedding_id: string
          name: string
          day_label: string | null
          event_date: string
          start_time: string | null
          end_time: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          name: string
          day_label?: string | null
          event_date: string
          start_time?: string | null
          end_time?: string | null
          location?: string | null
        }
        Update: Partial<Database['public']['Tables']['events']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'events_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
        ]
      }
      people: {
        Row: {
          id: string
          wedding_id: string
          name: string
          relationship: string | null
          phone: string | null
          email: string | null
          profile_photo_url: string | null
          app_access: boolean
          role_id: RoleId | null
          active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          name: string
          relationship?: string | null
          phone?: string | null
          email?: string | null
          profile_photo_url?: string | null
          app_access?: boolean
          role_id?: RoleId | null
          active?: boolean
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['people']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'people_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'people_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          },
        ]
      }
      user_accounts: {
        Row: {
          id: string
          person_id: string
          login_email: string
          account_status: string
          last_login: string | null
          created_at: string
        }
        Insert: {
          id: string
          person_id: string
          login_email: string
          account_status?: string
          last_login?: string | null
        }
        Update: Partial<Database['public']['Tables']['user_accounts']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'user_accounts_person_id_fkey'
            columns: ['person_id']
            isOneToOne: true
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
      task_categories: {
        Row: { id: string; wedding_id: string; name: string; is_active: boolean }
        Insert: { id?: string; wedding_id: string; name: string; is_active?: boolean }
        Update: Partial<Database['public']['Tables']['task_categories']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'task_categories_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
        ]
      }
      tasks: {
        Row: {
          id: string
          wedding_id: string
          event_id: string | null
          category_id: string | null
          name: string
          description: string | null
          assigned_person_id: string | null
          created_by: string | null
          due_date: string | null
          due_time: string | null
          priority: TaskPriority
          status: TaskStatus
          notes: string | null
          attachment_url: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          event_id?: string | null
          category_id?: string | null
          name: string
          description?: string | null
          assigned_person_id?: string | null
          created_by?: string | null
          due_date?: string | null
          due_time?: string | null
          priority?: TaskPriority
          status?: TaskStatus
          notes?: string | null
          attachment_url?: string | null
          completed_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'tasks_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'task_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_assigned_person_id_fkey'
            columns: ['assigned_person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_completed_by_fkey'
            columns: ['completed_by']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      touch_last_login: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
  }
}

export type Wedding = Database['public']['Tables']['weddings']['Row']
export type EventRow = Database['public']['Tables']['events']['Row']
export type Person = Database['public']['Tables']['people']['Row']
export type UserAccount = Database['public']['Tables']['user_accounts']['Row']
export type TaskCategory = Database['public']['Tables']['task_categories']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
