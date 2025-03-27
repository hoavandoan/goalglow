/**
 * Interface cho tham số tính toán khoản vay
 */
export interface LoanParams {
  loanAmount: number
  loanTermMonths: number
  fixedRate: number
  fixedMonths: number
  floatingRate: number
  paymentMethod: 'du_no_giam_dan' | 'tra_deu'
  earlyRepaymentYear: number
  earlyRepaymentFee: number
}

/**
 * Interface cho kết quả tính toán khoản vay
 */
export interface LoanResult {
  monthlyPaymentFixed: number
  monthlyPaymentFloating: number
  totalInterest: number
  earlyRepaymentFeeAmount: number
  totalCost: number
  amortizationSchedule: Array<{
    month: number
    principal: number
    interest: number
    balance: number
  }>
}

/**
 * Tính toán chi tiết khoản vay
 * @param params Tham số khoản vay
 * @returns Kết quả tính toán
 */
export function calculateLoan(params: LoanParams): LoanResult {
  const {
    loanAmount,
    loanTermMonths,
    fixedRate,
    fixedMonths,
    floatingRate,
    paymentMethod,
    earlyRepaymentYear,
    earlyRepaymentFee,
  } = params

  // Chuyển lãi suất từ % năm sang % tháng
  const monthlyFixedRate = fixedRate / 100 / 12
  const monthlyFloatingRate = floatingRate / 100 / 12

  let amortizationSchedule: Array<{
    month: number
    principal: number
    interest: number
    balance: number
  }> = []

  let totalInterest = 0
  let earlyRepaymentFeeAmount = 0
  let totalPrincipal = 0
  let monthlyPaymentFixed = 0
  let monthlyPaymentFloating = 0

  // Tính toán theo phương thức dư nợ giảm dần
  if (paymentMethod === 'du_no_giam_dan') {
    // Công thức PMT: (principal * rate) / (1 - (1 + rate)^-term)
    monthlyPaymentFixed =
      (loanAmount * monthlyFixedRate) / (1 - Math.pow(1 + monthlyFixedRate, -loanTermMonths))

    monthlyPaymentFloating =
      (loanAmount * monthlyFloatingRate) / (1 - Math.pow(1 + monthlyFloatingRate, -loanTermMonths))

    let remainingBalance = loanAmount

    for (let month = 1; month <= loanTermMonths; month++) {
      // Kiểm tra nếu trả trước hạn
      if (earlyRepaymentYear > 0 && month === earlyRepaymentYear * 12) {
        earlyRepaymentFeeAmount = remainingBalance * (earlyRepaymentFee / 100)
        break
      }

      const currentRate = month <= fixedMonths ? monthlyFixedRate : monthlyFloatingRate
      const currentPayment = month <= fixedMonths ? monthlyPaymentFixed : monthlyPaymentFloating

      const interestPayment = remainingBalance * currentRate
      const principalPayment = currentPayment - interestPayment

      totalInterest += interestPayment
      totalPrincipal += principalPayment
      remainingBalance -= principalPayment

      amortizationSchedule.push({
        month,
        principal: principalPayment,
        interest: interestPayment,
        balance: remainingBalance > 0 ? remainingBalance : 0,
      })
    }
  }
  // Tính toán theo phương thức trả đều hàng tháng
  else if (paymentMethod === 'tra_deu') {
    const monthlyPrincipal = loanAmount / loanTermMonths
    let remainingBalance = loanAmount

    for (let month = 1; month <= loanTermMonths; month++) {
      // Kiểm tra nếu trả trước hạn
      if (earlyRepaymentYear > 0 && month === earlyRepaymentYear * 12) {
        earlyRepaymentFeeAmount = remainingBalance * (earlyRepaymentFee / 100)
        break
      }

      const currentRate = month <= fixedMonths ? monthlyFixedRate : monthlyFloatingRate
      const interestPayment = remainingBalance * currentRate
      const totalMonthlyPayment = monthlyPrincipal + interestPayment

      // Trong tháng đầu tiên, lưu lại giá trị để hiển thị
      if (month === 1) {
        monthlyPaymentFixed = totalMonthlyPayment
      }

      // Trong tháng đầu tiên sau kỳ ưu đãi, lưu lại giá trị để hiển thị
      if (month === fixedMonths + 1) {
        monthlyPaymentFloating = totalMonthlyPayment
      }

      totalInterest += interestPayment
      remainingBalance -= monthlyPrincipal

      amortizationSchedule.push({
        month,
        principal: monthlyPrincipal,
        interest: interestPayment,
        balance: remainingBalance > 0 ? remainingBalance : 0,
      })
    }
  }

  // Tính tổng chi phí
  const totalCost = loanAmount + totalInterest + earlyRepaymentFeeAmount

  return {
    monthlyPaymentFixed,
    monthlyPaymentFloating,
    totalInterest,
    earlyRepaymentFeeAmount,
    totalCost,
    amortizationSchedule,
  }
}
