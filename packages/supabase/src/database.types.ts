export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      banks: {
        Row: {
          id: string
          name: string
          bank_group: 'state_owned' | 'joint_stock' | 'foreign'
          max_loan_ratio: number
          max_tenure: number
          is_top_priority: boolean
        }
        Insert: {
          id?: string
          name: string
          bank_group: 'state_owned' | 'joint_stock' | 'foreign'
          max_loan_ratio: number
          max_tenure: number
          is_top_priority?: boolean
        }
        Update: {
          id?: string
          name?: string
          bank_group?: 'state_owned' | 'joint_stock' | 'foreign'
          max_loan_ratio?: number
          max_tenure?: number
          is_top_priority?: boolean
        }
      }
      loan_types: {
        Row: {
          id: string
          bank_id: string
          type: 'home_loan' | 'consumer_loan'
          floating_rate: number
          collateral_type: 'unsecured' | 'secured'
        }
        Insert: {
          id?: string
          bank_id: string
          type: 'home_loan' | 'consumer_loan'
          floating_rate: number
          collateral_type: 'unsecured' | 'secured'
        }
        Update: {
          id?: string
          bank_id?: string
          type?: 'home_loan' | 'consumer_loan'
          floating_rate?: number
          collateral_type?: 'unsecured' | 'secured'
        }
      }
      rates: {
        Row: {
          id: string
          loan_type_id: string
          fixed_rate: number
          fixed_months: number
          min_tenure: number
        }
        Insert: {
          id?: string
          loan_type_id: string
          fixed_rate: number
          fixed_months: number
          min_tenure: number
        }
        Update: {
          id?: string
          loan_type_id?: string
          fixed_rate?: number
          fixed_months?: number
          min_tenure?: number
        }
      }
      early_repayment_fees: {
        Row: {
          id: string
          loan_type_id: string
          year: number
          fee: number
        }
        Insert: {
          id?: string
          loan_type_id: string
          year: number
          fee: number
        }
        Update: {
          id?: string
          loan_type_id?: string
          year?: number
          fee?: number
        }
      }
      loan_comparisons: {
        Row: {
          id: string
          bank_id: string
          loan_amount: number
          tenure_months: number
          payment_method: 'reducing_balance' | 'equal_installment'
          monthly_payment_fixed: number
          monthly_payment_float: number
          total_interest: number
          early_repayment_year?: number | null
          early_repayment_fee?: number | null
          total_cost: number
          created_at: string
        }
        Insert: {
          id?: string
          bank_id: string
          loan_amount: number
          tenure_months: number
          payment_method: 'reducing_balance' | 'equal_installment'
          monthly_payment_fixed: number
          monthly_payment_float: number
          total_interest: number
          early_repayment_year?: number | null
          early_repayment_fee?: number | null
          total_cost: number
          created_at?: string
        }
        Update: {
          id?: string
          bank_id?: string
          loan_amount?: number
          tenure_months?: number
          payment_method?: 'reducing_balance' | 'equal_installment'
          monthly_payment_fixed?: number
          monthly_payment_float?: number
          total_interest?: number
          early_repayment_year?: number | null
          early_repayment_fee?: number | null
          total_cost?: number
          created_at?: string
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
  }
}
