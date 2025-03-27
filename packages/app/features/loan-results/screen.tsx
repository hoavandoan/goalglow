import { useEffect, useState } from 'react'
import { useRouter } from 'solito/router'
import {
  Button,
  YStack,
  XStack,
  H2,
  H3,
  Paragraph,
  Separator,
  Spinner,
  ScrollView,
  Card,
  Text,
  AIAnalysis,
} from '@my/ui'

import {
  useBanks,
  useLoanTypes,
  useRates,
  useEarlyRepaymentFees,
  saveLoanComparison,
} from 'app/hooks/useBanks'
import { useAIAnalysis } from 'app/hooks/useAIAnalysis'
import { PaymentMethodType } from '@my/supabase'
import { useLoanResultsParams } from './params'

// Interface kết quả tính toán khoản vay
interface LoanResult {
  bankId: string
  bankName: string
  interestRate: number
  totalCost: number
  totalInterest: number
  monthlyPayment: number
  earlyRepaymentFee?: number
}

// Tính toán khoản vay
function calculateLoan(params: {
  amount: number
  term: number // tháng
  interestRate: number // phần trăm
  paymentMethod: PaymentMethodType
  earlyRepayment: number
  earlyRepaymentFee?: number
}): {
  totalCost: number
  totalInterest: number
  monthlyPayment: number
} {
  const {
    amount,
    term,
    interestRate,
    paymentMethod,
    earlyRepayment,
    earlyRepaymentFee = 0,
  } = params

  // Lãi suất hàng tháng
  const monthlyRate = interestRate / 100 / 12

  let monthlyPayment: number
  let totalInterest: number
  let totalCost: number

  // Phương thức thanh toán: dư nợ giảm dần hoặc gốc chia đều
  if (paymentMethod === 'reducing_balance') {
    // Dư nợ giảm dần (PMT formula)
    monthlyPayment =
      (amount * (monthlyRate * Math.pow(1 + monthlyRate, term))) /
      (Math.pow(1 + monthlyRate, term) - 1)
    totalCost = monthlyPayment * term
    totalInterest = totalCost - amount
  } else {
    // Gốc chia đều
    const principal = amount / term // Gốc trả mỗi tháng
    let remainingAmount = amount
    totalInterest = 0

    for (let i = 0; i < term; i++) {
      const interestForMonth = remainingAmount * monthlyRate
      totalInterest += interestForMonth
      remainingAmount -= principal
    }

    totalCost = amount + totalInterest
    monthlyPayment = totalCost / term
  }

  // Phí trả nợ trước hạn nếu có
  if (earlyRepayment !== 0 && earlyRepaymentFee) {
    // Giả sử trả trước 50% khoản vay sau 1/3 thời gian
    const earlyPaymentAmount = amount * 0.5
    const earlyPaymentFeeAmount = earlyPaymentAmount * (earlyRepaymentFee / 100)
    totalCost += earlyPaymentFeeAmount
  }

  return {
    totalCost,
    totalInterest,
    monthlyPayment,
  }
}

// Tạo phân tích AI về kết quả
function generateAnalysis(loanResults: LoanResult[]): string {
  if (!loanResults || loanResults.length === 0) {
    return 'Không có dữ liệu để phân tích'
  }

  // Sắp xếp kết quả theo tổng chi phí tăng dần
  const sortedResults = [...loanResults].sort((a, b) => a.totalCost - b.totalCost)

  const bestOption = sortedResults[0]
  const worstOption = sortedResults[sortedResults.length - 1]

  // Tính chênh lệch
  const difference = worstOption.totalCost - bestOption.totalCost
  const percentageDifference = (difference / bestOption.totalCost) * 100

  return `
# Phân tích khoản vay

## So sánh tổng quan
- Bạn đã so sánh ${loanResults.length} phương án vay từ các ngân hàng khác nhau.
- Khoản vay tốt nhất đến từ ngân hàng ${bestOption.bankName} với lãi suất ${bestOption.interestRate}%.
- Khoản vay kém lợi nhất đến từ ngân hàng ${worstOption.bankName} với lãi suất ${worstOption.interestRate}%.
- Chênh lệch chi phí giữa hai phương án: ${difference.toLocaleString()} VND (${percentageDifference.toFixed(2)}%).

## Phân tích chi tiết
- Với khoản vay tốt nhất, tổng chi phí là ${bestOption.totalCost.toLocaleString()} VND, trong đó tiền lãi chiếm ${bestOption.totalInterest.toLocaleString()} VND.
- Khoản trả hàng tháng: ${bestOption.monthlyPayment.toLocaleString()} VND.

## Lời khuyên
- Hãy cân nhắc kỹ không chỉ lãi suất mà còn các loại phí và chính sách liên quan.
- Nếu có khả năng, việc tăng số tiền trả gốc hàng tháng sẽ giúp giảm đáng kể tiền lãi phải trả.
- Nên xem xét khả năng thanh toán ổn định của bạn trong dài hạn trước khi quyết định.
  `
}

export function LoanResultsScreen() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loanResults, setLoanResults] = useState<LoanResult[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [aiError, setAiError] = useState<string | null>(null)

  // Kiểm tra phía client để tránh lỗi khi build
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Lấy thông tin khoản vay từ URL params thông qua Solito hook
  const loanParams = useLoanResultsParams()

  // Custom hooks để lấy dữ liệu
  const { data: banks, isLoading: isLoadingBanks } = useBanks(loanParams.bankGroup)
  const { data: loanTypes, isLoading: isLoadingLoanTypes } = useLoanTypes(
    loanParams.bankId || '',
    loanParams.loanType
  )
  const { data: rates, isLoading: isLoadingRates } = useRates(loanParams.bankId || '')
  const { data: fees, isLoading: isLoadingFees } = useEarlyRepaymentFees(loanParams.bankId || '')

  // AI Analysis hook
  const { loading: loadingAnalysis, error: analysisError, analyzeLoans } = useAIAnalysis()

  // Lấy dữ liệu và tính toán kết quả
  useEffect(() => {
    // Chỉ chạy phía client
    if (!isClient) return

    async function calculateResults() {
      if (isLoadingBanks || isLoadingLoanTypes || isLoadingRates || isLoadingFees) {
        return
      }

      setIsLoading(true)

      try {
        // Kiểm tra thông tin đầu vào
        if (!loanParams.loanAmount || !loanParams.loanTerm) {
          console.warn('Thông tin khoản vay không đầy đủ', loanParams)
          if (router) {
            router.push({
              pathname: '/loan-input',
            })
          }
          return
        }

        // Lọc ngân hàng theo nhóm nếu có
        let filteredBanks = banks || []
        if (loanParams.bankGroup) {
          filteredBanks = banks?.filter((bank) => bank.bank_group === loanParams.bankGroup) || []
        }

        // Nếu có bankId cụ thể, chỉ lấy ngân hàng đó
        if (loanParams.bankId) {
          filteredBanks = banks?.filter((bank) => bank.id === loanParams.bankId) || []
        }

        // Kiểm tra có ngân hàng nào phù hợp không
        if (!filteredBanks.length) {
          console.warn('Không tìm thấy ngân hàng phù hợp')
          setLoanResults([])
          setIsLoading(false)
          return
        }

        // Tính toán khoản vay cho từng ngân hàng
        const results: LoanResult[] = []

        for (const bank of filteredBanks) {
          // Tìm lãi suất phù hợp
          const bankLoanTypes = loanTypes?.filter((lt) => lt.bank_id === bank.id) || []
          const matchedLoanType = bankLoanTypes.find((lt) => lt.type === loanParams.loanType)

          if (!matchedLoanType) continue

          const bankRates = rates?.filter((rate) => rate.loan_type_id === matchedLoanType.id) || []

          // Sắp xếp theo thời hạn và lấy mức lãi suất phù hợp
          const sortedRates = bankRates.sort((a, b) => a.min_tenure - b.min_tenure)
          const bankRate =
            sortedRates.find((rate) => rate.min_tenure <= loanParams.loanTerm) || sortedRates[0]

          if (!bankRate) continue

          // Tìm phí trả nợ trước hạn nếu cần
          let earlyRepaymentFeeValue
          if (loanParams.earlyRepayment > 0) {
            const bankFees = fees?.filter((fee) => fee.loan_type_id === matchedLoanType.id) || []
            const feeInfo = bankFees.find((fee) => fee.year === loanParams.earlyRepayment)
            earlyRepaymentFeeValue = feeInfo?.fee || 0
          }

          // Tính toán kết quả
          const result = calculateLoan({
            amount: loanParams.loanAmount,
            term: loanParams.loanTerm,
            interestRate: bankRate.fixed_rate,
            paymentMethod: loanParams.paymentMethod,
            earlyRepayment: loanParams.earlyRepayment,
            earlyRepaymentFee: earlyRepaymentFeeValue,
          })

          results.push({
            bankId: bank.id,
            bankName: bank.name,
            interestRate: bankRate.fixed_rate,
            ...result,
            earlyRepaymentFee: earlyRepaymentFeeValue,
          })
        }

        // Sắp xếp kết quả theo tổng chi phí
        results.sort((a, b) => a.totalCost - b.totalCost)

        setLoanResults(results)
        setIsLoading(false)

        // Phân tích bằng AI cho 3 ngân hàng tốt nhất
        if (results.length > 0) {
          const topResults = results.slice(0, Math.min(3, results.length))

          try {
            const analysis = await analyzeLoans(topResults)
            setAiAnalysis(analysis)
          } catch (error) {
            console.error('Lỗi khi phân tích AI:', error)
            setAiError('Không thể tạo phân tích AI. Vui lòng thử lại sau.')
          }
        }
      } catch (error) {
        console.error('Lỗi khi tính toán kết quả khoản vay:', error)
      } finally {
        setIsLoading(false)
      }
    }

    calculateResults()
  }, [
    isClient,
    isLoadingBanks,
    isLoadingLoanTypes,
    isLoadingRates,
    isLoadingFees,
    loanParams,
    banks,
    loanTypes,
    rates,
    fees,
    router,
    analyzeLoans,
  ])

  // Xử lý quay lại trang tính toán
  const handleBackToCalculator = () => {
    if (isClient && router) {
      router.back()
    }
  }

  // Xử lý lưu kết quả so sánh
  const handleSaveComparison = async () => {
    if (!loanParams) return

    try {
      setIsSaving(true)

      const comparisonId = await saveLoanComparison({
        loanAmount: loanParams.loanAmount,
        loanTerm: loanParams.loanTerm,
        loanTypeId: parseInt(loanParams.bankId || '0'),
        bankGroupId: loanParams.bankGroup || 'state_owned',
        paymentMethod: loanParams.paymentMethod,
        earlyRepayment: loanParams.earlyRepayment.toString(),
        results: loanResults,
      })

      // Chỉ chuyển hướng phía client
      if (isClient && router) {
        // Chuyển đến trang lịch sử
        router.push({
          pathname: '/loan-history',
          query: { saved: 'true' },
        })
      }
    } catch (error) {
      console.error('Lỗi khi lưu kết quả:', error)
      // Hiển thị thông báo lỗi (nên thêm một component toast/alert)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <YStack flex={1} p="$4">
      <ScrollView>
        <YStack space="$4">
          <XStack space="$2" style={{ alignItems: 'center' }}>
            <H2 flex={1}>Kết quả so sánh lãi suất</H2>
            <Button size="$3" onPress={handleBackToCalculator} disabled={isLoading}>
              Quay lại
            </Button>
          </XStack>

          <Separator />

          {isLoading ? (
            <YStack height={300} style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Spinner size="large" color="$green10" />
              <Paragraph style={{ marginTop: '$4' }}>Đang tính toán kết quả...</Paragraph>
            </YStack>
          ) : (
            <YStack space="$4">
              {/* Thông tin khoản vay */}
              <Card p="$4" bordered>
                <YStack space="$2">
                  <H3>Thông tin khoản vay</H3>
                  <XStack style={{ justifyContent: 'space-between' }}>
                    <Paragraph>Số tiền vay:</Paragraph>
                    <Paragraph fontWeight="bold">
                      {loanParams.loanAmount.toLocaleString('vi-VN')} VND
                    </Paragraph>
                  </XStack>
                  <XStack style={{ justifyContent: 'space-between' }}>
                    <Paragraph>Thời hạn vay:</Paragraph>
                    <Paragraph fontWeight="bold">
                      {loanParams.loanTerm} tháng ({Math.floor(loanParams.loanTerm / 12)} năm{' '}
                      {loanParams.loanTerm % 12 > 0 ? `${loanParams.loanTerm % 12} tháng` : ''})
                    </Paragraph>
                  </XStack>
                  <XStack style={{ justifyContent: 'space-between' }}>
                    <Paragraph>Phương thức trả nợ:</Paragraph>
                    <Paragraph fontWeight="bold">
                      {loanParams.paymentMethod === 'reducing_balance'
                        ? 'Dư nợ giảm dần'
                        : 'Trả đều hàng tháng'}
                    </Paragraph>
                  </XStack>
                </YStack>
              </Card>

              {/* Phân tích AI */}
              {!loadingAnalysis && aiAnalysis && (
                <AIAnalysis text={aiAnalysis} loading={loadingAnalysis} errorMessage={aiError} />
              )}

              {/* Danh sách kết quả */}
              <H3>Kết quả so sánh ({loanResults.length} ngân hàng)</H3>

              {loanResults.length > 0 ? (
                <YStack space="$3">
                  {loanResults.map((result, index) => (
                    <Card
                      key={result.bankId}
                      p="$4"
                      bordered
                      theme={index === 0 ? 'green' : undefined}
                    >
                      <YStack space="$2">
                        <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                          <H3>{result.bankName}</H3>
                          {index === 0 && (
                            <Text
                              fontSize="$2"
                              style={{
                                backgroundColor: '#e6f2eb',
                                color: '#227a60',
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 4,
                              }}
                            >
                              Tốt nhất
                            </Text>
                          )}
                        </XStack>

                        <YStack space="$1">
                          <XStack style={{ justifyContent: 'space-between' }}>
                            <Paragraph>Lãi suất:</Paragraph>
                            <Paragraph fontWeight="bold">
                              {result.interestRate.toFixed(2)}%/năm
                            </Paragraph>
                          </XStack>
                          <XStack style={{ justifyContent: 'space-between' }}>
                            <Paragraph>Trả hàng tháng:</Paragraph>
                            <Paragraph fontWeight="bold">
                              {result.monthlyPayment.toLocaleString('vi-VN')} VND
                            </Paragraph>
                          </XStack>
                          <XStack style={{ justifyContent: 'space-between' }}>
                            <Paragraph>Tổng tiền lãi:</Paragraph>
                            <Paragraph fontWeight="bold">
                              {result.totalInterest.toLocaleString('vi-VN')} VND
                            </Paragraph>
                          </XStack>
                          <XStack style={{ justifyContent: 'space-between' }}>
                            <Paragraph fontWeight="bold">Tổng chi phí:</Paragraph>
                            <Paragraph
                              fontWeight="bold"
                              color={index === 0 ? '$green10' : '$red10'}
                            >
                              {result.totalCost.toLocaleString('vi-VN')} VND
                            </Paragraph>
                          </XStack>
                        </YStack>
                      </YStack>
                    </Card>
                  ))}
                </YStack>
              ) : (
                <Card p="$4" bordered>
                  <Paragraph style={{ textAlign: 'center' }}>
                    Không tìm thấy kết quả phù hợp. Vui lòng thay đổi thông tin khoản vay.
                  </Paragraph>
                </Card>
              )}

              {/* Nút lưu kết quả */}
              {loanResults.length > 0 && (
                <Button size="$4" theme="green" onPress={handleSaveComparison} disabled={isSaving}>
                  {isSaving ? 'Đang lưu...' : 'Lưu kết quả so sánh'}
                </Button>
              )}
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
