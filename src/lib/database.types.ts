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
      schools: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          role: 'student' | 'teacher' | 'head_teacher'
          school_id: string
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'student' | 'teacher' | 'head_teacher'
          school_id: string
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'student' | 'teacher' | 'head_teacher'
          school_id?: string
          full_name?: string | null
          created_at?: string
        }
      }
      classrooms: {
        Row: {
          id: string
          name: string
          school_id: string
          teacher_id: string | null
          subject: string | null
          grade_level: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          school_id: string
          teacher_id?: string | null
          subject?: string | null
          grade_level?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          school_id?: string
          teacher_id?: string | null
          subject?: string | null
          grade_level?: string | null
          created_at?: string
        }
      }
      progress: {
        Row: {
          id: string
          student_id: string
          classroom_id: string
          school_id: string
          score: number
          assignment_name: string
          date_submitted: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          classroom_id: string
          school_id: string
          score: number
          assignment_name: string
          date_submitted?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          classroom_id?: string
          school_id?: string
          score?: number
          assignment_name?: string
          date_submitted?: string
          notes?: string | null
          created_at?: string
        }
      }
      student_classrooms: {
        Row: {
          id: string
          student_id: string
          classroom_id: string
          school_id: string
          enrolled_at: string
        }
        Insert: {
          id?: string
          student_id: string
          classroom_id: string
          school_id: string
          enrolled_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          classroom_id?: string
          school_id?: string
          enrolled_at?: string
        }
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