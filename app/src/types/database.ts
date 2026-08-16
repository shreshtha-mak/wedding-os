// Hand-written to match supabase/migrations/0001_init_core.sql and 0002_rls_policies.sql.
// Once the Supabase project exists, regenerate with:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts
// and re-add the convenience aliases at the bottom.

export type TaskStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Completed'
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical'
export type RoleId = 'admin' | 'organiser' | 'restricted'
export type DecisionStatus = 'Pending' | 'Decided'
export type ChallengeStatus = 'Open' | 'Being Resolved' | 'Resolved'
export type AttendanceStatus = 'Pending' | 'Attending' | 'Not attending' | 'Maybe'
// "Own arrangement" and "Not needed" both count as satisfied for readiness;
// "Unknown" does not (it means the family hasn't determined this guest's
// need yet), and "Required" is only satisfied once it becomes "Arranged".
export type TransportRequirement = 'Unknown' | 'Not needed' | 'Own arrangement' | 'Required' | 'Arranged'
export type TransportStatus = 'Needed' | 'Assigned' | 'Confirmed' | 'Completed'
export type OutfitComponentStatus = 'Idea' | 'To Buy' | 'In Making' | 'In Alteration' | 'Ready'
export type ThingStatus = 'Idea' | 'To Buy' | 'Bought' | 'To Prepare' | 'Packed' | 'At Venue' | 'Returned'
export type VendorStatus = 'Prospect' | 'Shortlisted' | 'Confirmed' | 'Completed' | 'Cancelled'
export type VendorAssignmentStatus = 'Pending' | 'Confirmed' | 'Completed'
export type ChecklistItemStatus = 'Not Started' | 'In Progress' | 'Done'
export type MenuStatus = 'Draft' | 'Discussing' | 'Finalised'
export type DecorCategory =
  | 'Mandap/Stage'
  | 'Entrance'
  | 'Seating'
  | 'Lighting'
  | 'Floral'
  | 'Table Settings'
  | 'Photo Booth'
  | 'Signage'
  | 'Other'
export type DecorStatus = 'Concept' | 'Confirmed' | 'In Progress' | 'Done'
export type AccommodationBookingStatus = 'Requested' | 'Confirmed' | 'Cancelled'
export type DocumentStorageType = 'upload' | 'external'
export type PersonCategory = 'family' | 'guest'
export type DecorContext = 'event' | 'home'
export type DecorHomeArea = 'house' | 'garden'
export type DietaryRequirement =
  | 'None'
  | 'Vegetarian'
  | 'Vegan'
  | 'Jain'
  | 'Gluten-free'
  | 'Allergy'
  | 'Other'
export type TimelineItemType =
  | 'Event activity'
  | 'Vendor'
  | 'Setup'
  | 'Family'
  | 'Guest'
  | 'Food'
  | 'Ceremony'
  | 'Performance'
  | 'Photography'
  | 'Transport'
  | 'Packing'
  | 'Payment'
  | 'Other'

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
          category: PersonCategory
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
          category?: PersonCategory
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
      timeline_items: {
        Row: {
          id: string
          wedding_id: string
          event_id: string
          activity: string
          type: TimelineItemType
          start_time: string | null
          end_time: string | null
          location: string | null
          responsible_person_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          event_id: string
          activity: string
          type?: TimelineItemType
          start_time?: string | null
          end_time?: string | null
          location?: string | null
          responsible_person_id?: string | null
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['timeline_items']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'timeline_items_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'timeline_items_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'timeline_items_responsible_person_id_fkey'
            columns: ['responsible_person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
      decisions: {
        Row: {
          id: string
          wedding_id: string
          event_id: string | null
          category_id: string | null
          question: string
          options: string[]
          responsible_person_id: string | null
          deadline: string | null
          status: DecisionStatus
          selected_option: string | null
          decided_by_person_ids: string[]
          decided_date: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          event_id?: string | null
          category_id?: string | null
          question: string
          options?: string[]
          responsible_person_id?: string | null
          deadline?: string | null
          status?: DecisionStatus
          selected_option?: string | null
          decided_by_person_ids?: string[]
          decided_date?: string | null
          notes?: string | null
          created_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['decisions']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'decisions_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'decisions_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'decisions_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'task_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'decisions_responsible_person_id_fkey'
            columns: ['responsible_person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
      challenges: {
        Row: {
          id: string
          wedding_id: string
          event_id: string | null
          category_id: string | null
          title: string
          description: string | null
          owner_person_id: string | null
          priority: TaskPriority
          date_identified: string
          deadline: string | null
          status: ChallengeStatus
          resolution: string | null
          related_task_id: string | null
          resolved_at: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          event_id?: string | null
          category_id?: string | null
          title: string
          description?: string | null
          owner_person_id?: string | null
          priority?: TaskPriority
          date_identified?: string
          deadline?: string | null
          status?: ChallengeStatus
          resolution?: string | null
          related_task_id?: string | null
          notes?: string | null
          created_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['challenges']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'challenges_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'challenges_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'challenges_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'task_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'challenges_owner_person_id_fkey'
            columns: ['owner_person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'challenges_related_task_id_fkey'
            columns: ['related_task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
        ]
      }
      guests: {
        Row: {
          id: string
          wedding_id: string
          person_id: string
          family_group: string | null
          dietary_requirements: string[]
          dietary_notes: string | null
          accommodation_required: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          person_id: string
          family_group?: string | null
          dietary_requirements?: string[]
          dietary_notes?: string | null
          accommodation_required?: boolean
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['guests']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'guests_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'guests_person_id_fkey'
            columns: ['person_id']
            isOneToOne: true
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
      guest_event_attendance: {
        Row: {
          id: string
          guest_id: string
          event_id: string
          status: AttendanceStatus
          num_attending: number
          transportation_status: TransportRequirement
          arrived: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          guest_id: string
          event_id: string
          status?: AttendanceStatus
          num_attending?: number
          transportation_status?: TransportRequirement
          arrived?: boolean
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['guest_event_attendance']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'guest_event_attendance_guest_id_fkey'
            columns: ['guest_id']
            isOneToOne: false
            referencedRelation: 'guests'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'guest_event_attendance_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
        ]
      }
      accommodation_locations: {
        Row: {
          id: string
          wedding_id: string
          name: string
          type: string | null
          address: string | null
          contact_person: string | null
          phone: string | null
          check_in_time: string | null
          check_out_time: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          name: string
          type?: string | null
          address?: string | null
          contact_person?: string | null
          phone?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['accommodation_locations']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'accommodation_locations_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
        ]
      }
      accommodation_bookings: {
        Row: {
          id: string
          wedding_id: string
          location_id: string
          vendor_id: string | null
          booking_reference: string | null
          check_in: string | null
          check_out: string | null
          num_rooms: number
          cost: number | null
          status: AccommodationBookingStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          location_id: string
          vendor_id?: string | null
          booking_reference?: string | null
          check_in?: string | null
          check_out?: string | null
          num_rooms?: number
          cost?: number | null
          status?: AccommodationBookingStatus
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['accommodation_bookings']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'accommodation_bookings_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'accommodation_bookings_location_id_fkey'
            columns: ['location_id']
            isOneToOne: false
            referencedRelation: 'accommodation_locations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'accommodation_bookings_vendor_id_fkey'
            columns: ['vendor_id']
            isOneToOne: false
            referencedRelation: 'vendors'
            referencedColumns: ['id']
          },
        ]
      }
      accommodation_rooms: {
        Row: {
          id: string
          location_id: string
          room_name: string
          capacity: number
          booking_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          location_id: string
          room_name: string
          capacity?: number
          booking_id?: string | null
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['accommodation_rooms']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'accommodation_rooms_location_id_fkey'
            columns: ['location_id']
            isOneToOne: false
            referencedRelation: 'accommodation_locations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'accommodation_rooms_booking_id_fkey'
            columns: ['booking_id']
            isOneToOne: false
            referencedRelation: 'accommodation_bookings'
            referencedColumns: ['id']
          },
        ]
      }
      accommodation_assignments: {
        Row: {
          id: string
          room_id: string
          guest_id: string
          check_in: string | null
          check_out: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          guest_id: string
          check_in?: string | null
          check_out?: string | null
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['accommodation_assignments']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'accommodation_assignments_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'accommodation_rooms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'accommodation_assignments_guest_id_fkey'
            columns: ['guest_id']
            isOneToOne: false
            referencedRelation: 'guests'
            referencedColumns: ['id']
          },
        ]
      }
      transportation: {
        Row: {
          id: string
          wedding_id: string
          event_id: string | null
          person_id: string | null
          group_label: string | null
          pickup_location: string | null
          destination: string | null
          transport_date: string | null
          transport_time: string | null
          responsible_person_id: string | null
          driver: string | null
          vehicle: string | null
          num_passengers: number
          status: TransportStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          event_id?: string | null
          person_id?: string | null
          group_label?: string | null
          pickup_location?: string | null
          destination?: string | null
          transport_date?: string | null
          transport_time?: string | null
          responsible_person_id?: string | null
          driver?: string | null
          vehicle?: string | null
          num_passengers?: number
          status?: TransportStatus
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['transportation']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'transportation_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transportation_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transportation_person_id_fkey'
            columns: ['person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transportation_responsible_person_id_fkey'
            columns: ['responsible_person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
      outfits: {
        Row: {
          id: string
          wedding_id: string
          person_id: string
          event_id: string
          description: string | null
          outfit_name: string | null
          outfit_status: OutfitComponentStatus
          shoes_name: string | null
          shoes_status: OutfitComponentStatus
          jewellery_name: string | null
          jewellery_status: OutfitComponentStatus
          accessories_name: string | null
          accessories_status: OutfitComponentStatus
          is_ready: boolean
          vendor_tailor: string | null
          cost: number | null
          ready_date: string | null
          responsible_person_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          person_id: string
          event_id: string
          description?: string | null
          outfit_name?: string | null
          outfit_status?: OutfitComponentStatus
          shoes_name?: string | null
          shoes_status?: OutfitComponentStatus
          jewellery_name?: string | null
          jewellery_status?: OutfitComponentStatus
          accessories_name?: string | null
          accessories_status?: OutfitComponentStatus
          vendor_tailor?: string | null
          cost?: number | null
          ready_date?: string | null
          responsible_person_id?: string | null
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['outfits']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'outfits_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'outfits_person_id_fkey'
            columns: ['person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'outfits_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'outfits_responsible_person_id_fkey'
            columns: ['responsible_person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
      things_to_take: {
        Row: {
          id: string
          wedding_id: string
          event_id: string | null
          item_name: string
          quantity: number
          responsible_person_id: string | null
          status: ThingStatus
          purchase_required: boolean
          cost: number | null
          where_stored: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          event_id?: string | null
          item_name: string
          quantity?: number
          responsible_person_id?: string | null
          status?: ThingStatus
          purchase_required?: boolean
          cost?: number | null
          where_stored?: string | null
          notes?: string | null
          created_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['things_to_take']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'things_to_take_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'things_to_take_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'things_to_take_responsible_person_id_fkey'
            columns: ['responsible_person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
      budget_categories: {
        Row: { id: string; wedding_id: string; name: string; is_active: boolean }
        Insert: { id?: string; wedding_id: string; name: string; is_active?: boolean }
        Update: Partial<Database['public']['Tables']['budget_categories']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'budget_categories_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
        ]
      }
      vendors: {
        Row: {
          id: string
          wedding_id: string
          name: string
          category_id: string | null
          contact_person: string | null
          phone: string | null
          whatsapp: string | null
          email: string | null
          address: string | null
          status: VendorStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          name: string
          category_id?: string | null
          contact_person?: string | null
          phone?: string | null
          whatsapp?: string | null
          email?: string | null
          address?: string | null
          status?: VendorStatus
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['vendors']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'vendors_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'vendors_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'budget_categories'
            referencedColumns: ['id']
          },
        ]
      }
      vendor_event_assignments: {
        Row: {
          id: string
          vendor_id: string
          event_id: string
          responsibility: string | null
          setup_time: string | null
          status: VendorAssignmentStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          event_id: string
          responsibility?: string | null
          setup_time?: string | null
          status?: VendorAssignmentStatus
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['vendor_event_assignments']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'vendor_event_assignments_vendor_id_fkey'
            columns: ['vendor_id']
            isOneToOne: false
            referencedRelation: 'vendors'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'vendor_event_assignments_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
        ]
      }
      vendor_checklist_items: {
        Row: {
          id: string
          assignment_id: string
          item_name: string
          responsible_contact: string | null
          due_date: string | null
          status: ChecklistItemStatus
          completed_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          item_name: string
          responsible_contact?: string | null
          due_date?: string | null
          status?: ChecklistItemStatus
          completed_date?: string | null
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['vendor_checklist_items']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'vendor_checklist_items_assignment_id_fkey'
            columns: ['assignment_id']
            isOneToOne: false
            referencedRelation: 'vendor_event_assignments'
            referencedColumns: ['id']
          },
        ]
      }
      decor_items: {
        Row: {
          id: string
          wedding_id: string
          event_id: string | null
          context: DecorContext
          home_area: DecorHomeArea | null
          name: string
          category: DecorCategory
          vendor_id: string | null
          status: DecorStatus
          cost: number | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          event_id?: string | null
          context?: DecorContext
          home_area?: DecorHomeArea | null
          name: string
          category?: DecorCategory
          vendor_id?: string | null
          status?: DecorStatus
          cost?: number | null
          notes?: string | null
          created_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['decor_items']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'decor_items_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'decor_items_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'decor_items_vendor_id_fkey'
            columns: ['vendor_id']
            isOneToOne: false
            referencedRelation: 'vendors'
            referencedColumns: ['id']
          },
        ]
      }
      menus: {
        Row: {
          id: string
          wedding_id: string
          event_id: string
          status: MenuStatus
          caterer_vendor_id: string | null
          finalised_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          event_id: string
          status?: MenuStatus
          caterer_vendor_id?: string | null
          finalised_date?: string | null
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['menus']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'menus_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'menus_event_id_fkey'
            columns: ['event_id']
            isOneToOne: true
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'menus_caterer_vendor_id_fkey'
            columns: ['caterer_vendor_id']
            isOneToOne: false
            referencedRelation: 'vendors'
            referencedColumns: ['id']
          },
        ]
      }
      menu_items: {
        Row: {
          id: string
          menu_id: string
          item_name: string
          category_id: string
          is_vegetarian: boolean | null
          is_active: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          menu_id: string
          item_name: string
          category_id: string
          is_vegetarian?: boolean | null
          is_active?: boolean
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'menu_items_menu_id_fkey'
            columns: ['menu_id']
            isOneToOne: false
            referencedRelation: 'menus'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'menu_items_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'menu_categories'
            referencedColumns: ['id']
          },
        ]
      }
      menu_categories: {
        Row: { id: string; wedding_id: string; name: string; is_active: boolean }
        Insert: { id?: string; wedding_id: string; name: string; is_active?: boolean }
        Update: Partial<Database['public']['Tables']['menu_categories']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'menu_categories_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
        ]
      }
      expenses: {
        Row: {
          id: string
          wedding_id: string
          event_id: string | null
          category_id: string | null
          vendor_id: string | null
          name: string
          budgeted_amount: number | null
          quoted_amount: number | null
          finalised_amount: number | null
          due_date: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          event_id?: string | null
          category_id?: string | null
          vendor_id?: string | null
          name: string
          budgeted_amount?: number | null
          quoted_amount?: number | null
          finalised_amount?: number | null
          due_date?: string | null
          notes?: string | null
          created_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'expenses_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'expenses_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'expenses_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'budget_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'expenses_vendor_id_fkey'
            columns: ['vendor_id']
            isOneToOne: false
            referencedRelation: 'vendors'
            referencedColumns: ['id']
          },
        ]
      }
      payments: {
        Row: {
          id: string
          expense_id: string
          amount: number
          payment_date: string
          payment_method: string | null
          paid_by_person_id: string | null
          reference_number: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          expense_id: string
          amount: number
          payment_date?: string
          payment_method?: string | null
          paid_by_person_id?: string | null
          reference_number?: string | null
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'payments_expense_id_fkey'
            columns: ['expense_id']
            isOneToOne: false
            referencedRelation: 'expenses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_paid_by_person_id_fkey'
            columns: ['paid_by_person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
      documents: {
        Row: {
          id: string
          wedding_id: string
          name: string
          storage_path: string | null
          storage_type: DocumentStorageType
          external_url: string | null
          file_type: string | null
          file_size: number | null
          event_id: string | null
          vendor_id: string | null
          expense_id: string | null
          guest_id: string | null
          task_id: string | null
          uploaded_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          name: string
          storage_path?: string | null
          storage_type?: DocumentStorageType
          external_url?: string | null
          file_type?: string | null
          file_size?: number | null
          event_id?: string | null
          vendor_id?: string | null
          expense_id?: string | null
          guest_id?: string | null
          task_id?: string | null
          uploaded_by?: string | null
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'documents_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documents_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documents_vendor_id_fkey'
            columns: ['vendor_id']
            isOneToOne: false
            referencedRelation: 'vendors'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documents_expense_id_fkey'
            columns: ['expense_id']
            isOneToOne: false
            referencedRelation: 'expenses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documents_guest_id_fkey'
            columns: ['guest_id']
            isOneToOne: false
            referencedRelation: 'guests'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documents_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
        ]
      }
      activity_log: {
        Row: {
          id: string
          wedding_id: string
          actor_person_id: string | null
          entity_type: string
          entity_id: string | null
          action: string
          summary: string
          created_at: string
        }
        Insert: never
        Update: never
        Relationships: [
          {
            foreignKeyName: 'activity_log_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'activity_log_actor_person_id_fkey'
            columns: ['actor_person_id']
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
      link_user_account: {
        Args: { target_person_id: string; target_email: string }
        Returns: void
      }
      update_my_profile: {
        Args: { p_name: string; p_phone: string | null }
        Returns: void
      }
      log_activity: {
        Args: {
          p_entity_type: string
          p_entity_id: string | null
          p_action: string
          p_summary: string
        }
        Returns: void
      }
    }
  }
}

export type Wedding = Database['public']['Tables']['weddings']['Row']
export type WeddingInsert = Database['public']['Tables']['weddings']['Insert']
export type EventRow = Database['public']['Tables']['events']['Row']
export type Person = Database['public']['Tables']['people']['Row']
export type UserAccount = Database['public']['Tables']['user_accounts']['Row']
export type TaskCategory = Database['public']['Tables']['task_categories']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TimelineItem = Database['public']['Tables']['timeline_items']['Row']
export type TimelineItemInsert = Database['public']['Tables']['timeline_items']['Insert']
export type ActivityLogEntry = Database['public']['Tables']['activity_log']['Row']
export type Decision = Database['public']['Tables']['decisions']['Row']
export type DecisionInsert = Database['public']['Tables']['decisions']['Insert']
export type Challenge = Database['public']['Tables']['challenges']['Row']
export type ChallengeInsert = Database['public']['Tables']['challenges']['Insert']
export type Guest = Database['public']['Tables']['guests']['Row']
export type GuestInsert = Database['public']['Tables']['guests']['Insert']
export type GuestEventAttendance = Database['public']['Tables']['guest_event_attendance']['Row']
export type GuestEventAttendanceInsert = Database['public']['Tables']['guest_event_attendance']['Insert']
export type AccommodationLocation = Database['public']['Tables']['accommodation_locations']['Row']
export type AccommodationLocationInsert = Database['public']['Tables']['accommodation_locations']['Insert']
export type AccommodationBooking = Database['public']['Tables']['accommodation_bookings']['Row']
export type AccommodationBookingInsert = Database['public']['Tables']['accommodation_bookings']['Insert']
export type AccommodationRoom = Database['public']['Tables']['accommodation_rooms']['Row']
export type AccommodationRoomInsert = Database['public']['Tables']['accommodation_rooms']['Insert']
export type AccommodationAssignment = Database['public']['Tables']['accommodation_assignments']['Row']
export type AccommodationAssignmentInsert = Database['public']['Tables']['accommodation_assignments']['Insert']
export type Transportation = Database['public']['Tables']['transportation']['Row']
export type TransportationInsert = Database['public']['Tables']['transportation']['Insert']
export type Outfit = Database['public']['Tables']['outfits']['Row']
export type OutfitInsert = Database['public']['Tables']['outfits']['Insert']
export type ThingToTake = Database['public']['Tables']['things_to_take']['Row']
export type ThingToTakeInsert = Database['public']['Tables']['things_to_take']['Insert']
export type BudgetCategory = Database['public']['Tables']['budget_categories']['Row']
export type Vendor = Database['public']['Tables']['vendors']['Row']
export type VendorInsert = Database['public']['Tables']['vendors']['Insert']
export type VendorEventAssignment = Database['public']['Tables']['vendor_event_assignments']['Row']
export type VendorEventAssignmentInsert = Database['public']['Tables']['vendor_event_assignments']['Insert']
export type VendorChecklistItem = Database['public']['Tables']['vendor_checklist_items']['Row']
export type VendorChecklistItemInsert = Database['public']['Tables']['vendor_checklist_items']['Insert']
export type DecorItem = Database['public']['Tables']['decor_items']['Row']
export type DecorItemInsert = Database['public']['Tables']['decor_items']['Insert']
export type Menu = Database['public']['Tables']['menus']['Row']
export type MenuInsert = Database['public']['Tables']['menus']['Insert']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']
export type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert']
export type MenuCategory = Database['public']['Tables']['menu_categories']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type Payment = Database['public']['Tables']['payments']['Row']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type WeddingDocument = Database['public']['Tables']['documents']['Row']
export type WeddingDocumentInsert = Database['public']['Tables']['documents']['Insert']
