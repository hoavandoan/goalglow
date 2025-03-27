import { z } from 'zod'

// Enum types
export const BankGroupEnum = z.enum(['state_owned', 'joint_stock', 'foreign'])
export type BankGroupType = z.infer<typeof BankGroupEnum>

export const LoanTypeEnum = z.enum(['home_loan', 'consumer_loan'])
export type LoanTypeType = z.infer<typeof LoanTypeEnum>

export const CollateralTypeEnum = z.enum(['unsecured', 'secured'])
export type CollateralTypeType = z.infer<typeof CollateralTypeEnum>

export const PaymentMethodEnum = z.enum(['reducing_balance', 'equal_installment'])
export type PaymentMethodType = z.infer<typeof PaymentMethodEnum>

// Schema definitions
export const BankSchema = z.object({
  id: z.string(),
  name: z.string(),
  bank_group: BankGroupEnum,
  max_loan_ratio: z.number(),
  max_tenure: z.number(),
  is_top_priority: z.boolean(),
  created_at: z.coerce.date().optional(),
})
export type Bank = z.infer<typeof BankSchema>

export const LoanTypeSchema = z.object({
  id: z.string(),
  bank_id: z.string(),
  type: LoanTypeEnum,
  floating_rate: z.number(),
  collateral_type: CollateralTypeEnum,
  created_at: z.coerce.date().optional(),
})
export type LoanType = z.infer<typeof LoanTypeSchema>

export const RateSchema = z.object({
  id: z.string(),
  loan_type_id: z.string(),
  fixed_rate: z.number(),
  fixed_months: z.number(),
  min_tenure: z.number(),
  created_at: z.coerce.date().optional(),
})
export type Rate = z.infer<typeof RateSchema>

export const EarlyRepaymentFeeSchema = z.object({
  id: z.string(),
  loan_type_id: z.string(),
  year: z.number(),
  fee: z.number(),
  created_at: z.coerce.date().optional(),
})
export type EarlyRepaymentFee = z.infer<typeof EarlyRepaymentFeeSchema>

export const LoanComparisonSchema = z.object({
  id: z.string().optional(),
  bank_id: z.string(),
  loan_amount: z.number(),
  tenure_months: z.number(),
  payment_method: PaymentMethodEnum,
  monthly_payment_fixed: z.number(),
  monthly_payment_float: z.number(),
  total_interest: z.number(),
  early_repayment_year: z.number().optional(),
  early_repayment_fee: z.number().optional(),
  total_cost: z.number(),
  created_at: z.coerce.date().optional(),
})
export type LoanComparison = z.infer<typeof LoanComparisonSchema>

// Input types
export const LoanInputSchema = z.object({
  loan_amount: z.number().min(1000000),
  tenure_months: z.number().min(3),
  loan_type: LoanTypeEnum,
  bank_group: BankGroupEnum.optional(),
  bank_id: z.string().optional(),
  payment_method: PaymentMethodEnum,
  early_repayment_year: z.number().optional(),
})
export type LoanInput = z.infer<typeof LoanInputSchema>

// Types cho data từ Supabase
export interface BankGroup {
  id: string
  name: string
}

export interface LoanComparisonInput {
  bank_id: string
  loan_amount: number
  tenure_months: number
  payment_method: 'reducing_balance' | 'equal_installment'
  monthly_payment_fixed: number
  monthly_payment_float: number
  total_interest: number
  early_repayment_year: number | null
  early_repayment_fee: number
  total_cost: number
}
