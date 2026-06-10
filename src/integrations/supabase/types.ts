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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      akpi_changelog: {
        Row: {
          akpi_code: string | null
          changed_by: string | null
          changed_by_email: string | null
          created_at: string
          field_changed: string
          id: string
          indicator_id: string | null
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          akpi_code?: string | null
          changed_by?: string | null
          changed_by_email?: string | null
          created_at?: string
          field_changed: string
          id?: string
          indicator_id?: string | null
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          akpi_code?: string | null
          changed_by?: string | null
          changed_by_email?: string | null
          created_at?: string
          field_changed?: string
          id?: string
          indicator_id?: string | null
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "akpi_changelog_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "akpi_indicators"
            referencedColumns: ["id"]
          },
        ]
      }
      akpi_indicators: {
        Row: {
          akpi_code: string
          aspirasi: string
          created_at: string
          definition_bm: string | null
          definition_en: string | null
          direction: string
          id: string
          indicator_bm: string
          indicator_en: string | null
          lead_agency: string | null
          metric_type: string | null
          review_cycle: string | null
          sort_order: number
          source_note: string | null
          target_2035: number | null
          updated_at: string
          validation_note: string | null
        }
        Insert: {
          akpi_code: string
          aspirasi: string
          created_at?: string
          definition_bm?: string | null
          definition_en?: string | null
          direction?: string
          id?: string
          indicator_bm: string
          indicator_en?: string | null
          lead_agency?: string | null
          metric_type?: string | null
          review_cycle?: string | null
          sort_order?: number
          source_note?: string | null
          target_2035?: number | null
          updated_at?: string
          validation_note?: string | null
        }
        Update: {
          akpi_code?: string
          aspirasi?: string
          created_at?: string
          definition_bm?: string | null
          definition_en?: string | null
          direction?: string
          id?: string
          indicator_bm?: string
          indicator_en?: string | null
          lead_agency?: string | null
          metric_type?: string | null
          review_cycle?: string | null
          sort_order?: number
          source_note?: string | null
          target_2035?: number | null
          updated_at?: string
          validation_note?: string | null
        }
        Relationships: []
      }
      akpi_yearly_values: {
        Row: {
          created_at: string
          id: string
          indicator_id: string
          updated_at: string
          value: number | null
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          indicator_id: string
          updated_at?: string
          value?: number | null
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          indicator_id?: string
          updated_at?: string
          value?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "akpi_yearly_values_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "akpi_indicators"
            referencedColumns: ["id"]
          },
        ]
      }
      attachment_overseas: {
        Row: {
          country: string
          created_at: string
          dept_memo_date: string | null
          dept_memo_ref: string | null
          destination_institution: string
          funding_type: string
          id: string
          institution: string
          matter_id: string
          office_memo_date: string | null
          office_memo_ref: string | null
          program_end_date: string
          program_start_date: string
          programmes: string[]
          student_count: number
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          dept_memo_date?: string | null
          dept_memo_ref?: string | null
          destination_institution: string
          funding_type: string
          id?: string
          institution: string
          matter_id: string
          office_memo_date?: string | null
          office_memo_ref?: string | null
          program_end_date: string
          program_start_date: string
          programmes?: string[]
          student_count?: number
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          dept_memo_date?: string | null
          dept_memo_ref?: string | null
          destination_institution?: string
          funding_type?: string
          id?: string
          institution?: string
          matter_id?: string
          office_memo_date?: string | null
          office_memo_ref?: string | null
          program_end_date?: string
          program_start_date?: string
          programmes?: string[]
          student_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachment_overseas_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      biweekly_pay_settings: {
        Row: {
          created_at: string
          first_pay_date: string
          id: string
          pay_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_pay_date: string
          id?: string
          pay_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_pay_date?: string
          id?: string
          pay_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_dropdown_options: {
        Row: {
          created_at: string
          field_name: string
          id: string
          option_value: string
          user_id: string
        }
        Insert: {
          created_at?: string
          field_name: string
          id?: string
          option_value: string
          user_id: string
        }
        Update: {
          created_at?: string
          field_name?: string
          id?: string
          option_value?: string
          user_id?: string
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          description: string
          expense_date: string
          id: string
          is_recurring: boolean
          pay_period: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          is_recurring?: boolean
          pay_period?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          is_recurring?: boolean
          pay_period?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_section_order: {
        Row: {
          created_at: string
          id: string
          section_order: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          section_order?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          section_order?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fixed_commitments: {
        Row: {
          amount: number
          category: string
          created_at: string
          custom_label: string | null
          description: string
          id: string
          is_active: boolean
          pay_period: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string
          custom_label?: string | null
          description: string
          id?: string
          is_active?: boolean
          pay_period?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          custom_label?: string | null
          description?: string
          id?: string
          is_active?: boolean
          pay_period?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gtci_strategic_analysis: {
        Row: {
          created_at: string
          data_gap_indicators: Json
          document_title: string
          executive_summary: Json
          expected_outcomes: Json
          funding_model: Json
          id: string
          implementation_roadmap: Json
          indicator_analysis: Json
          metadata: Json
          ministry_governance: Json
          pillar_performance: Json
          updated_at: string
          user_id: string
          wef_participation_steps: Json
        }
        Insert: {
          created_at?: string
          data_gap_indicators?: Json
          document_title?: string
          executive_summary?: Json
          expected_outcomes?: Json
          funding_model?: Json
          id?: string
          implementation_roadmap?: Json
          indicator_analysis?: Json
          metadata?: Json
          ministry_governance?: Json
          pillar_performance?: Json
          updated_at?: string
          user_id: string
          wef_participation_steps?: Json
        }
        Update: {
          created_at?: string
          data_gap_indicators?: Json
          document_title?: string
          executive_summary?: Json
          expected_outcomes?: Json
          funding_model?: Json
          id?: string
          implementation_roadmap?: Json
          indicator_analysis?: Json
          metadata?: Json
          ministry_governance?: Json
          pillar_performance?: Json
          updated_at?: string
          user_id?: string
          wef_participation_steps?: Json
        }
        Relationships: []
      }
      leave_balances: {
        Row: {
          annual_entitlement: number
          created_at: string
          id: string
          other_entitlement: number
          sick_entitlement: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          annual_entitlement?: number
          created_at?: string
          id?: string
          other_entitlement?: number
          sick_entitlement?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          annual_entitlement?: number
          created_at?: string
          id?: string
          other_entitlement?: number
          sick_entitlement?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      leaves: {
        Row: {
          created_at: string
          days_used: number
          end_date: string
          id: string
          leave_type: string
          notes: string | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_used: number
          end_date: string
          id?: string
          leave_type?: string
          notes?: string | null
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_used?: number
          end_date?: string
          id?: string
          leave_type?: string
          notes?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loan_tracker: {
        Row: {
          biweekly_repayment: number
          created_at: string
          current_balance: number
          id: string
          initial_amount: number
          is_active: boolean
          label: string
          loan_type: string
          notes: string | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          biweekly_repayment?: number
          created_at?: string
          current_balance?: number
          id?: string
          initial_amount?: number
          is_active?: boolean
          label: string
          loan_type?: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          biweekly_repayment?: number
          created_at?: string
          current_balance?: number
          id?: string
          initial_amount?: number
          is_active?: boolean
          label?: string
          loan_type?: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      matters: {
        Row: {
          assigned_to: string | null
          case_id: string
          case_title: string
          case_type: string
          created_at: string
          deadline: string | null
          dsm_submitted_date: string
          external_link: string | null
          hu_returned_to_suthe_date: string | null
          id: string
          overall_sla_days: number
          overall_status: string
          priority: string
          query_issued_date: string | null
          query_response_date: string | null
          query_status: string
          received_from: string | null
          remarks: string | null
          second_query_issued_date: string | null
          second_query_response_date: string | null
          second_query_status: string | null
          second_suthe_submitted_to_hu_date: string | null
          signed_date: string | null
          sla_status: string
          suthe_pass_to_department: string | null
          suthe_pass_to_department_date: string | null
          suthe_received_date: string
          suthe_submitted_to_hu_date: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_id: string
          case_title: string
          case_type: string
          created_at?: string
          deadline?: string | null
          dsm_submitted_date: string
          external_link?: string | null
          hu_returned_to_suthe_date?: string | null
          id?: string
          overall_sla_days?: number
          overall_status?: string
          priority?: string
          query_issued_date?: string | null
          query_response_date?: string | null
          query_status?: string
          received_from?: string | null
          remarks?: string | null
          second_query_issued_date?: string | null
          second_query_response_date?: string | null
          second_query_status?: string | null
          second_suthe_submitted_to_hu_date?: string | null
          signed_date?: string | null
          sla_status?: string
          suthe_pass_to_department?: string | null
          suthe_pass_to_department_date?: string | null
          suthe_received_date: string
          suthe_submitted_to_hu_date?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string
          case_title?: string
          case_type?: string
          created_at?: string
          deadline?: string | null
          dsm_submitted_date?: string
          external_link?: string | null
          hu_returned_to_suthe_date?: string | null
          id?: string
          overall_sla_days?: number
          overall_status?: string
          priority?: string
          query_issued_date?: string | null
          query_response_date?: string | null
          query_status?: string
          received_from?: string | null
          remarks?: string | null
          second_query_issued_date?: string | null
          second_query_response_date?: string | null
          second_query_status?: string | null
          second_suthe_submitted_to_hu_date?: string | null
          signed_date?: string | null
          sla_status?: string
          suthe_pass_to_department?: string | null
          suthe_pass_to_department_date?: string | null
          suthe_received_date?: string
          suthe_submitted_to_hu_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          attendees: string[]
          created_at: string
          description: string | null
          id: string
          location: string | null
          meeting_date: string
          meeting_time: string | null
          meeting_type: string
          required_items: string[]
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees?: string[]
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          meeting_date: string
          meeting_time?: string | null
          meeting_type?: string
          required_items?: string[]
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees?: string[]
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          meeting_date?: string
          meeting_time?: string | null
          meeting_type?: string
          required_items?: string[]
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_budgets: {
        Row: {
          budget_amount: number
          category_id: string | null
          created_at: string
          id: string
          month: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          budget_amount?: number
          category_id?: string | null
          created_at?: string
          id?: string
          month: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          budget_amount?: number
          category_id?: string | null
          created_at?: string
          id?: string
          month?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_commitment_tracking: {
        Row: {
          actual_amount: number | null
          commitment_id: string
          created_at: string
          id: string
          is_paid: boolean
          month: number
          notes: string | null
          paid_date: string | null
          pay_period: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          actual_amount?: number | null
          commitment_id: string
          created_at?: string
          id?: string
          is_paid?: boolean
          month: number
          notes?: string | null
          paid_date?: string | null
          pay_period?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          actual_amount?: number | null
          commitment_id?: string
          created_at?: string
          id?: string
          is_paid?: boolean
          month?: number
          notes?: string | null
          paid_date?: string | null
          pay_period?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_commitment_tracking_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "fixed_commitments"
            referencedColumns: ["id"]
          },
        ]
      }
      net_worth_entries: {
        Row: {
          amount: number
          created_at: string
          entry_type: string
          id: string
          label: string
          logged_at: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          entry_type: string
          id?: string
          label: string
          logged_at?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          entry_type?: string
          id?: string
          label?: string
          logged_at?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          color: string
          content: string
          created_at: string
          id: string
          pinned: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          content?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          content?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      page_permissions: {
        Row: {
          can_access: boolean
          created_at: string
          id: string
          page_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_access?: boolean
          created_at?: string
          id?: string
          page_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_access?: boolean
          created_at?: string
          id?: string
          page_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      playground_scorecards: {
        Row: {
          created_at: string
          dashboard_title: string
          id: string
          indicators: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dashboard_title?: string
          id?: string
          indicators?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dashboard_title?: string
          id?: string
          indicators?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_approved: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_approved?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_approved?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          blockers: string[]
          created_at: string
          description: string | null
          id: string
          notes: Json
          source_matter_id: string | null
          status: string
          tasks: Json
          title: string
          updated_at: string
          user_id: string
          weekly_score: number | null
          workflow_tasks: Json
          workflow_template_name: string | null
        }
        Insert: {
          blockers?: string[]
          created_at?: string
          description?: string | null
          id?: string
          notes?: Json
          source_matter_id?: string | null
          status?: string
          tasks?: Json
          title: string
          updated_at?: string
          user_id: string
          weekly_score?: number | null
          workflow_tasks?: Json
          workflow_template_name?: string | null
        }
        Update: {
          blockers?: string[]
          created_at?: string
          description?: string | null
          id?: string
          notes?: Json
          source_matter_id?: string | null
          status?: string
          tasks?: Json
          title?: string
          updated_at?: string
          user_id?: string
          weekly_score?: number | null
          workflow_tasks?: Json
          workflow_template_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_source_matter_id_fkey"
            columns: ["source_matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_done: boolean
          is_pinned: boolean
          source: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_done?: boolean
          is_pinned?: boolean
          source?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_done?: boolean
          is_pinned?: boolean
          source?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      retirement_contributions: {
        Row: {
          amount: number
          created_at: string
          fund_id: string
          id: string
          month: number
          notes: string | null
          pay_period: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          amount: number
          created_at?: string
          fund_id: string
          id?: string
          month: number
          notes?: string | null
          pay_period?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          amount?: number
          created_at?: string
          fund_id?: string
          id?: string
          month?: number
          notes?: string | null
          pay_period?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "retirement_contributions_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "retirement_fund"
            referencedColumns: ["id"]
          },
        ]
      }
      retirement_fund: {
        Row: {
          biweekly_contribution: number
          created_at: string
          fund_name: string
          id: string
          is_active: boolean
          notes: string | null
          start_date: string
          target_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          biweekly_contribution?: number
          created_at?: string
          fund_name?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          start_date?: string
          target_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          biweekly_contribution?: number
          created_at?: string
          fund_name?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          start_date?: string
          target_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      running_logs: {
        Row: {
          created_at: string
          date: string
          distance: number
          duration_minutes: number
          environment: string
          heart_rate: number | null
          id: string
          is_planned: boolean
          linked_training_date: string | null
          notes: string | null
          pace_per_km: number | null
          run_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          distance: number
          duration_minutes: number
          environment?: string
          heart_rate?: number | null
          id?: string
          is_planned?: boolean
          linked_training_date?: string | null
          notes?: string | null
          pace_per_km?: number | null
          run_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          distance?: number
          duration_minutes?: number
          environment?: string
          heart_rate?: number | null
          id?: string
          is_planned?: boolean
          linked_training_date?: string | null
          notes?: string | null
          pace_per_km?: number | null
          run_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      savings_contributions: {
        Row: {
          amount: number
          created_at: string
          goal_id: string
          id: string
          month: number
          notes: string | null
          pay_period: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          amount: number
          created_at?: string
          goal_id: string
          id?: string
          month: number
          notes?: string | null
          pay_period?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          amount?: number
          created_at?: string
          goal_id?: string
          id?: string
          month?: number
          notes?: string | null
          pay_period?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "savings_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          target_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          target_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          target_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sidebar_config: {
        Row: {
          created_at: string
          group_name: string
          id: string
          item_path: string
          item_title: string
          sort_order: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          group_name: string
          id?: string
          item_path: string
          item_title: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          group_name?: string
          id?: string
          item_path?: string
          item_title?: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      sla_configurations: {
        Row: {
          at_risk_days: number
          case_type: string
          created_at: string
          critical_days: number
          id: string
          sla_days: number
          updated_at: string
        }
        Insert: {
          at_risk_days?: number
          case_type: string
          created_at?: string
          critical_days?: number
          id?: string
          sla_days?: number
          updated_at?: string
        }
        Update: {
          at_risk_days?: number
          case_type?: string
          created_at?: string
          critical_days?: number
          id?: string
          sla_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      sub_todos: {
        Row: {
          created_at: string
          id: string
          is_done: boolean
          is_timer_running: boolean
          step_order: number
          timer_elapsed_seconds: number
          title: string
          todo_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_done?: boolean
          is_timer_running?: boolean
          step_order?: number
          timer_elapsed_seconds?: number
          title: string
          todo_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_done?: boolean
          is_timer_running?: boolean
          step_order?: number
          timer_elapsed_seconds?: number
          title?: string
          todo_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_todos_todo_id_fkey"
            columns: ["todo_id"]
            isOneToOne: false
            referencedRelation: "todos"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          created_at: string
          id: string
          is_main_timer_running: boolean
          main_timer_elapsed_seconds: number
          project_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_main_timer_running?: boolean
          main_timer_elapsed_seconds?: number
          project_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_main_timer_running?: boolean
          main_timer_elapsed_seconds?: number
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_shortcuts: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_steps: {
        Row: {
          created_at: string
          estimated_days: number | null
          id: string
          responsible_party: string | null
          step_description: string | null
          step_order: number
          step_title: string
          updated_at: string
          workflow_name: string
        }
        Insert: {
          created_at?: string
          estimated_days?: number | null
          id?: string
          responsible_party?: string | null
          step_description?: string | null
          step_order: number
          step_title: string
          updated_at?: string
          workflow_name: string
        }
        Update: {
          created_at?: string
          estimated_days?: number | null
          id?: string
          responsible_party?: string | null
          step_description?: string | null
          step_order?: number
          step_title?: string
          updated_at?: string
          workflow_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
