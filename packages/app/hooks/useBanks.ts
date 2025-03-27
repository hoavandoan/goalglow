import { useQuery } from '@tanstack/react-query'
import {
  getBankGroups,
  getBanks,
  getLoanTypes,
  getRates,
  getEarlyRepaymentFees,
  getLoanComparisons,
  getLoanComparisonById,
  Bank,
  BankGroupType,
  LoanTypeType,
  supabase,
} from '@my/supabase'
import { useState, useEffect } from 'react'

/**
 * Hook để lấy danh sách nhóm ngân hàng
 */
export function useBankGroups() {
  return useQuery({
    queryKey: ['bankGroups'],
    queryFn: getBankGroups,
  })
}

/**
 * Hook để lấy danh sách ngân hàng theo nhóm
 * @param group Nhóm ngân hàng
 */
export function useBanks(group?: BankGroupType) {
  return useQuery({
    queryKey: ['banks', group],
    queryFn: () => getBanks(group as BankGroupType),
    enabled: !!group,
  })
}

/**
 * Hook để lấy thông tin loại vay
 * @param bankId ID của ngân hàng
 * @param type Loại vay (home_loan, consumer_loan)
 */
export function useLoanTypes(bankId: string, type?: LoanTypeType) {
  return useQuery({
    queryKey: ['loanTypes', bankId, type],
    queryFn: () => getLoanTypes(bankId, type as LoanTypeType),
    enabled: !!bankId && !!type,
  })
}

/**
 * Hook để lấy thông tin lãi suất
 * @param loanTypeId ID của loại vay
 */
export function useRates(loanTypeId: string) {
  return useQuery({
    queryKey: ['rates', loanTypeId],
    queryFn: () => getRates(loanTypeId),
    enabled: !!loanTypeId,
  })
}

/**
 * Hook để lấy thông tin phí phạt trả nợ trước hạn
 * @param loanTypeId ID của loại vay
 */
export function useEarlyRepaymentFees(loanTypeId: string) {
  return useQuery({
    queryKey: ['earlyRepaymentFees', loanTypeId],
    queryFn: () => getEarlyRepaymentFees(loanTypeId),
    enabled: !!loanTypeId,
  })
}

/**
 * Hook để lấy lịch sử so sánh khoản vay
 * @param limit Số lượng kết quả trả về (mặc định 10)
 */
export function useLoanComparisons(limit = 10) {
  return useQuery({
    queryKey: ['loanComparisons', limit],
    queryFn: () => getLoanComparisons(limit),
  })
}

/**
 * Hook để lấy chi tiết một kết quả so sánh khoản vay
 * @param id ID của kết quả so sánh
 */
export function useLoanComparisonById(id: string) {
  return useQuery({
    queryKey: ['loanComparison', id],
    queryFn: () => getLoanComparisonById(id),
    enabled: !!id,
  })
}

export function useBanksByGroup() {
  const [bankGroups, setBankGroups] = useState<{ [key: string]: Bank[] }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBanksByGroup() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from('banks').select('*').order('name')

        if (error) {
          throw error
        }

        // Nhóm ngân hàng theo loại
        const groups: { [key: string]: Bank[] } = {}

        data?.forEach((bank) => {
          if (!groups[bank.bank_group]) {
            groups[bank.bank_group] = []
          }
          groups[bank.bank_group].push(bank)
        })

        setBankGroups(groups)
      } catch (error) {
        setError('Không thể lấy dữ liệu ngân hàng')
        console.error('Error fetching banks by group:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBanksByGroup()
  }, [])

  return { bankGroups, loading, error }
}

export async function saveLoanComparison(params: {
  loanAmount: number
  loanTerm: number
  loanTypeId: number
  bankGroupId?: string
  paymentMethod: 'reducing_balance' | 'equal_installment'
  earlyRepayment: string
  results: any[] // Kết quả so sánh
}) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Bạn cần đăng nhập để lưu kết quả so sánh')
    }

    // Lưu thông tin so sánh
    const { data: comparisonData, error: comparisonError } = await supabase
      .from('loan_comparisons')
      .insert({
        user_id: user.id,
        loan_amount: params.loanAmount,
        loan_term: params.loanTerm,
        loan_type_id: params.loanTypeId,
        bank_group_id: params.bankGroupId || null,
        payment_method: params.paymentMethod,
        early_repayment: params.earlyRepayment,
      })
      .select()

    if (comparisonError) {
      throw comparisonError
    }

    const comparisonId = comparisonData[0].id

    // Lưu kết quả chi tiết
    const resultsToInsert = params.results.map((result) => ({
      loan_comparison_id: comparisonId,
      bank_id: result.bankId,
      bank_name: result.bankName,
      interest_rate: result.interestRate,
      total_cost: result.totalCost,
      total_interest: result.totalInterest,
      monthly_payment: result.monthlyPayment,
      early_repayment_fee: result.earlyRepaymentFee || 0,
    }))

    const { error: resultsError } = await supabase
      .from('loan_comparison_results')
      .insert(resultsToInsert)

    if (resultsError) {
      throw resultsError
    }

    return comparisonId
  } catch (error) {
    console.error('Error saving loan comparison:', error)
    throw error
  }
}
