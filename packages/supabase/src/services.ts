import { supabase } from './client'
import {
  Bank,
  BankGroup,
  BankGroupType,
  BankSchema,
  CollateralTypeType,
  EarlyRepaymentFee,
  EarlyRepaymentFeeSchema,
  LoanComparison,
  LoanComparisonSchema,
  LoanInput,
  LoanType,
  LoanTypeSchema,
  LoanTypeType,
  Rate,
  RateSchema,
} from './types'

/**
 * Lấy danh sách các nhóm ngân hàng cho dropdown
 * @returns Danh sách các nhóm ngân hàng đã được định dạng
 */
export async function getBankGroups(): Promise<BankGroup[]> {
  const { data, error } = await supabase
    .from('banks')
    .select('bank_group', { count: 'exact' })
    .not('bank_group', 'is', null)

  if (error) {
    console.error('Error fetching bank groups:', error)
    throw error
  }

  // Map các nhóm ngân hàng thành định dạng hiển thị
  const groupLabels: Record<string, string> = {
    state_owned: 'Ngân hàng Nhà nước',
    joint_stock: 'Ngân hàng TMCP',
    foreign: 'Ngân hàng Nước ngoài',
  }

  // Biến đổi dữ liệu từ supabase và loại bỏ các giá trị trùng lặp
  const uniqueGroups = new Map<string, string>()

  data.forEach((item) => {
    const groupId = item.bank_group
    if (groupId && !uniqueGroups.has(groupId)) {
      uniqueGroups.set(groupId, groupLabels[groupId as keyof typeof groupLabels] || groupId)
    }
  })

  // Chuyển từ Map sang mảng kết quả
  return Array.from(uniqueGroups).map(([id, name]) => ({
    id,
    name,
  }))
}

/**
 * Lấy danh sách ngân hàng theo nhóm
 * @param group Nhóm ngân hàng
 * @param topOnly Chỉ lấy các ngân hàng ưu tiên
 * @returns Danh sách ngân hàng
 */
export async function getBanks(group?: BankGroupType, topOnly: boolean = false) {
  let query = supabase.from('banks').select('*')

  // Filter by group if provided
  if (group) {
    query = query.eq('bank_group', group)
  }

  // Filter for top priority banks if needed
  if (topOnly) {
    query = query.eq('is_top_priority', true)
  }

  const { data, error } = await query.order('name')

  if (error) {
    console.error('Error fetching banks:', error)
    throw error
  }

  // Validate with Zod
  return data.map((bank) => BankSchema.parse(bank))
}

/**
 * Lấy thông tin loại vay theo ngân hàng và loại vay
 * @param bankId ID của ngân hàng
 * @param loanType Loại vay
 * @param collateralType Loại tài sản bảo đảm
 * @returns Danh sách loại vay
 */
export async function getLoanTypes(
  bankId: string,
  loanType?: LoanTypeType,
  collateralType?: CollateralTypeType
) {
  let query = supabase.from('loan_types').select('*').eq('bank_id', bankId)

  if (loanType) {
    query = query.eq('type', loanType)
  }

  if (collateralType) {
    query = query.eq('collateral_type', collateralType)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching loan types:', error)
    throw error
  }

  return data.map((loanType) => LoanTypeSchema.parse(loanType))
}

/**
 * Lấy thông tin lãi suất theo loại vay
 * @param loanTypeId ID của loại vay
 * @returns Danh sách lãi suất
 */
export async function getRates(loanTypeId: string) {
  const { data, error } = await supabase
    .from('rates')
    .select('*')
    .eq('loan_type_id', loanTypeId)
    .order('min_tenure')

  if (error) {
    console.error('Error fetching rates:', error)
    throw error
  }

  return data.map((rate) => RateSchema.parse(rate))
}

/**
 * Lấy thông tin phí phạt trả nợ trước hạn
 * @param loanTypeId ID của loại vay
 * @returns Danh sách phí phạt
 */
export async function getEarlyRepaymentFees(loanTypeId: string) {
  const { data, error } = await supabase
    .from('early_repayment_fees')
    .select('*')
    .eq('loan_type_id', loanTypeId)
    .order('year')

  if (error) {
    console.error('Error fetching early repayment fees:', error)
    throw error
  }

  return data.map((fee) => EarlyRepaymentFeeSchema.parse(fee))
}

/**
 * Lưu kết quả so sánh khoản vay
 * @param comparison Dữ liệu so sánh
 * @returns Kết quả so sánh đã lưu
 */
export async function saveLoanComparison(comparison: Omit<LoanComparison, 'id' | 'created_at'>) {
  // Validate with Zod first
  const validComparison = LoanComparisonSchema.parse(comparison)

  const { data, error } = await supabase.from('loan_comparisons').insert(validComparison).select()

  if (error) {
    console.error('Error saving loan comparison:', error)
    throw error
  }

  return data[0]
}

/**
 * Lấy lịch sử so sánh khoản vay
 * @param limit Số kết quả trả về
 * @returns Danh sách kết quả so sánh
 */
export async function getLoanComparisons(limit = 10) {
  const { data, error } = await supabase
    .from('loan_comparisons')
    .select('*, banks(*)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching loan comparisons:', error)
    throw error
  }

  return data
}

/**
 * Lấy chi tiết một kết quả so sánh khoản vay
 * @param id ID của kết quả so sánh
 * @returns Chi tiết kết quả so sánh
 */
export async function getLoanComparisonById(id: string) {
  const { data, error } = await supabase
    .from('loan_comparisons')
    .select('*, banks(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching loan comparison details:', error)
    throw error
  }

  return data
}

// Calculate loan details
export async function calculateLoan(input: LoanInput) {
  // This will fetch all necessary data and perform calculations
  // Return value will be used for displaying results

  // 1. Get banks based on criteria
  let banks: Bank[]
  if (input.bank_id) {
    // Get specific bank
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .eq('id', input.bank_id)
      .limit(1)

    if (error || !data.length) {
      throw new Error('Bank not found')
    }

    banks = [BankSchema.parse(data[0])]
  } else {
    // Get all relevant banks
    banks = await getBanks(input.bank_group, true)
  }

  // 2. For each bank, get loan types and calculate
  const results = await Promise.all(
    banks.map(async (bank) => {
      // Get loan types for this bank
      const loanTypes = await getLoanTypes(bank.id, input.loan_type)

      // For each loan type, calculate loan details
      const loanTypeResults = await Promise.all(
        loanTypes.map(async (loanType) => {
          // Get rates for this loan type
          const rates = await getRates(loanType.id)

          // Find applicable rate based on tenure
          const applicableRate =
            rates.find((rate) => rate.min_tenure <= input.tenure_months) || rates[0]

          // Get early repayment fee if applicable
          let earlyRepaymentFee: EarlyRepaymentFee | null = null
          if (input.early_repayment_year) {
            const fees = await getEarlyRepaymentFees(loanType.id)
            earlyRepaymentFee = fees.find((fee) => fee.year === input.early_repayment_year) || null
          }

          // Calculate monthly payments and totals
          const result = calculateLoanPayments(
            input.loan_amount,
            input.tenure_months,
            applicableRate.fixed_rate,
            loanType.floating_rate,
            applicableRate.fixed_months,
            input.payment_method,
            earlyRepaymentFee?.fee || 0,
            input.early_repayment_year
          )

          return {
            bank,
            loanType,
            rate: applicableRate,
            earlyRepaymentFee,
            ...result,
          }
        })
      )

      return loanTypeResults
    })
  )

  // Flatten the results array
  return results.flat()
}

// Helper function to calculate loan payments
function calculateLoanPayments(
  loanAmount: number,
  tenureMonths: number,
  fixedRate: number,
  floatingRate: number,
  fixedMonths: number,
  paymentMethod: 'reducing_balance' | 'equal_installment',
  earlyRepaymentFeePercent: number = 0,
  earlyRepaymentYear: number | undefined = undefined
) {
  // Convert annual rates to monthly rates
  const fixedMonthlyRate = fixedRate / 100 / 12
  const floatingMonthlyRate = floatingRate / 100 / 12

  let monthlyPaymentFixed = 0
  let monthlyPaymentFloat = 0
  let totalInterest = 0
  let earlyRepaymentFeeAmount = 0

  // Handle early repayment if applicable
  const actualTenureMonths = earlyRepaymentYear
    ? Math.min(earlyRepaymentYear * 12, tenureMonths)
    : tenureMonths

  if (paymentMethod === 'reducing_balance') {
    // Declining balance method
    // Fixed rate period
    if (fixedMonths > 0) {
      // PMT formula: PMT = P × r × (1 + r)^n / ((1 + r)^n - 1)
      monthlyPaymentFixed =
        (loanAmount * fixedMonthlyRate * Math.pow(1 + fixedMonthlyRate, actualTenureMonths)) /
        (Math.pow(1 + fixedMonthlyRate, actualTenureMonths) - 1)

      // If early repayment during fixed period
      if (earlyRepaymentYear && earlyRepaymentYear * 12 <= fixedMonths) {
        const earlyMonths = earlyRepaymentYear * 12

        // Calculate remaining balance at early repayment
        let remainingBalance = loanAmount
        let fixedInterest = 0

        for (let i = 0; i < earlyMonths; i++) {
          const interestPayment = remainingBalance * fixedMonthlyRate
          const principalPayment = monthlyPaymentFixed - interestPayment
          remainingBalance -= principalPayment
          fixedInterest += interestPayment
        }

        totalInterest = fixedInterest
        earlyRepaymentFeeAmount = remainingBalance * (earlyRepaymentFeePercent / 100)
      }
      // If early repayment after fixed period
      else if (earlyRepaymentYear && fixedMonths < earlyRepaymentYear * 12) {
        // Calculate fixed period interest
        let remainingBalance = loanAmount
        let fixedInterest = 0

        for (let i = 0; i < fixedMonths; i++) {
          const interestPayment = remainingBalance * fixedMonthlyRate
          const principalPayment = monthlyPaymentFixed - interestPayment
          remainingBalance -= principalPayment
          fixedInterest += interestPayment
        }

        // Calculate floating period
        monthlyPaymentFloat =
          (remainingBalance *
            floatingMonthlyRate *
            Math.pow(1 + floatingMonthlyRate, actualTenureMonths - fixedMonths)) /
          (Math.pow(1 + floatingMonthlyRate, actualTenureMonths - fixedMonths) - 1)

        let floatingInterest = 0
        for (let i = 0; i < earlyRepaymentYear * 12 - fixedMonths; i++) {
          const interestPayment = remainingBalance * floatingMonthlyRate
          const principalPayment = monthlyPaymentFloat - interestPayment
          remainingBalance -= principalPayment
          floatingInterest += interestPayment
        }

        totalInterest = fixedInterest + floatingInterest
        earlyRepaymentFeeAmount = remainingBalance * (earlyRepaymentFeePercent / 100)
      }
      // No early repayment
      else {
        // Fixed period interest
        let remainingBalance = loanAmount
        let fixedInterest = 0

        for (let i = 0; i < fixedMonths; i++) {
          const interestPayment = remainingBalance * fixedMonthlyRate
          const principalPayment = monthlyPaymentFixed - interestPayment
          remainingBalance -= principalPayment
          fixedInterest += interestPayment
        }

        // Floating period
        if (fixedMonths < tenureMonths) {
          monthlyPaymentFloat =
            (remainingBalance *
              floatingMonthlyRate *
              Math.pow(1 + floatingMonthlyRate, tenureMonths - fixedMonths)) /
            (Math.pow(1 + floatingMonthlyRate, tenureMonths - fixedMonths) - 1)

          let floatingInterest = 0
          for (let i = 0; i < tenureMonths - fixedMonths; i++) {
            const interestPayment = remainingBalance * floatingMonthlyRate
            const principalPayment = monthlyPaymentFloat - interestPayment
            remainingBalance -= principalPayment
            floatingInterest += interestPayment
          }

          totalInterest = fixedInterest + floatingInterest
        } else {
          totalInterest = fixedInterest
        }
      }
    } else {
      // Only floating rate
      monthlyPaymentFloat =
        (loanAmount * floatingMonthlyRate * Math.pow(1 + floatingMonthlyRate, actualTenureMonths)) /
        (Math.pow(1 + floatingMonthlyRate, actualTenureMonths) - 1)

      if (earlyRepaymentYear) {
        const earlyMonths = earlyRepaymentYear * 12

        let remainingBalance = loanAmount
        let interest = 0

        for (let i = 0; i < earlyMonths; i++) {
          const interestPayment = remainingBalance * floatingMonthlyRate
          const principalPayment = monthlyPaymentFloat - interestPayment
          remainingBalance -= principalPayment
          interest += interestPayment
        }

        totalInterest = interest
        earlyRepaymentFeeAmount = remainingBalance * (earlyRepaymentFeePercent / 100)
      } else {
        // Calculate total interest for full term
        let remainingBalance = loanAmount

        for (let i = 0; i < tenureMonths; i++) {
          const interestPayment = remainingBalance * floatingMonthlyRate
          const principalPayment = monthlyPaymentFloat - interestPayment
          remainingBalance -= principalPayment
          totalInterest += interestPayment
        }
      }
    }
  } else {
    // Equal monthly payment method
    const monthlyPrincipal = loanAmount / tenureMonths

    // Calculate interest for each month
    let remainingBalance = loanAmount
    let totalFixedInterest = 0
    let totalFloatingInterest = 0

    for (let i = 0; i < actualTenureMonths; i++) {
      // Apply fixed rate for the fixed period
      if (i < fixedMonths) {
        const monthlyInterest = remainingBalance * fixedMonthlyRate
        totalFixedInterest += monthlyInterest

        // First month payment with fixed rate
        if (i === 0) {
          monthlyPaymentFixed = monthlyPrincipal + monthlyInterest
        }
      }
      // Apply floating rate after fixed period
      else {
        const monthlyInterest = remainingBalance * floatingMonthlyRate
        totalFloatingInterest += monthlyInterest

        // First month payment with floating rate
        if (i === fixedMonths) {
          monthlyPaymentFloat = monthlyPrincipal + monthlyInterest
        }
      }

      // Reduce balance by principal payment
      remainingBalance -= monthlyPrincipal
    }

    totalInterest = totalFixedInterest + totalFloatingInterest

    // Calculate early repayment fee if applicable
    if (earlyRepaymentYear) {
      earlyRepaymentFeeAmount = remainingBalance * (earlyRepaymentFeePercent / 100)
    }
  }

  // Calculate total cost
  const totalCost = loanAmount + totalInterest + earlyRepaymentFeeAmount

  return {
    monthly_payment_fixed: Math.round(monthlyPaymentFixed),
    monthly_payment_float: Math.round(monthlyPaymentFloat || monthlyPaymentFixed),
    total_interest: Math.round(totalInterest),
    early_repayment_fee: Math.round(earlyRepaymentFeeAmount),
    total_cost: Math.round(totalCost),
  }
}
