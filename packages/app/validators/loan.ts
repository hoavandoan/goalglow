import { z } from 'zod'
import { BankGroupEnum, LoanTypeEnum, PaymentMethodEnum } from '@my/supabase'

// Schema cho form nhập khoản vay
export const LoanInputFormSchema = z.object({
  loanAmount: z.number().min(10000000, 'Số tiền vay tối thiểu 10 triệu VND'),
  loanTerm: z.string().min(1, 'Vui lòng chọn thời hạn vay'),
  loanType: LoanTypeEnum,
  bankGroup: BankGroupEnum,
  bankId: z.string().min(1, 'Vui lòng chọn ngân hàng'),
  paymentMethod: PaymentMethodEnum,
  earlyRepayment: z.string(),
})

export type LoanInputFormType = z.infer<typeof LoanInputFormSchema>

// Schema cho query params
export const LoanQueryParamsSchema = z.object({
  loanAmount: z.coerce.number().min(10000000, 'Số tiền vay tối thiểu 10 triệu VND'),
  loanTerm: z.coerce.number().min(1, 'Thời hạn vay không hợp lệ'),
  loanType: LoanTypeEnum,
  bankGroup: BankGroupEnum.optional(),
  bankId: z.string().optional(),
  paymentMethod: PaymentMethodEnum,
  earlyRepayment: z.coerce.number().min(0).max(5),
})

export type LoanQueryParamsType = z.infer<typeof LoanQueryParamsSchema>

// Các options cho dropdown
export const loanTermOptions = [
  { value: '3', label: '3 tháng' },
  { value: '6', label: '6 tháng' },
  { value: '12', label: '12 tháng' },
  { value: '24', label: '24 tháng' },
  { value: '36', label: '36 tháng' },
  { value: '60', label: '5 năm' },
  { value: '120', label: '10 năm' },
  { value: '240', label: '20 năm' },
  { value: '360', label: '30 năm' },
]

export const loanTypeOptions = [
  { value: 'home_loan', label: 'Vay mua nhà - Thế chấp' },
  { value: 'consumer_loan', label: 'Vay tiêu dùng - Tín chấp' },
]

export const paymentMethodOptions = [
  { value: 'reducing_balance', label: 'Dư nợ giảm dần' },
  { value: 'equal_installment', label: 'Trả đều hàng tháng' },
]

export const earlyRepaymentOptions = [
  { value: '0', label: 'Không' },
  { value: '1', label: 'Năm 1' },
  { value: '2', label: 'Năm 2' },
  { value: '3', label: 'Năm 3' },
  { value: '4', label: 'Năm 4' },
  { value: '5', label: 'Năm 5+' },
]

// Parse và validate query params
export function parseQueryParams(
  query: Record<string, string | string[] | undefined>
): LoanQueryParamsType {
  try {
    // Convert các giá trị từ query thành dữ liệu có thể validate
    const parsedQuery = {
      loanAmount: query.loanAmount ? String(query.loanAmount) : undefined,
      loanTerm: query.loanTerm ? String(query.loanTerm) : undefined,
      loanType: (query.loanType as string) || 'home_loan',
      bankGroup: (query.bankGroup as string) || 'state_owned',
      bankId: (query.bankId as string) || undefined,
      paymentMethod: (query.paymentMethod as string) || 'reducing_balance',
      earlyRepayment: query.earlyRepayment ? String(query.earlyRepayment) : '0',
    }

    // Parse và validate với schema
    const result = LoanQueryParamsSchema.safeParse(parsedQuery)

    // Nếu validate thành công, trả về kết quả
    if (result.success) {
      return result.data
    }

    // Nếu có lỗi, ghi log và trả về giá trị mặc định
    console.error('Validation error for query params:', result.error)

    // Default values
    return {
      loanAmount: 500000000,
      loanTerm: 60,
      loanType: 'home_loan',
      bankGroup: 'state_owned',
      paymentMethod: 'reducing_balance',
      earlyRepayment: 0,
    }
  } catch (error) {
    console.error('Error parsing query params:', error)

    // Default values
    return {
      loanAmount: 500000000,
      loanTerm: 60,
      loanType: 'home_loan',
      bankGroup: 'state_owned',
      paymentMethod: 'reducing_balance',
      earlyRepayment: 0,
    }
  }
}
