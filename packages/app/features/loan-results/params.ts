import { createParam } from 'solito'
import { LoanQueryParamsType, parseQueryParams } from 'app/validators/loan'

// Định nghĩa type cho params của màn hình kết quả khoản vay
type LoanResultsScreenParams = {
  loanAmount: string
  loanTerm: string
  loanType: string
  bankGroup?: string
  bankId?: string
  paymentMethod: string
  earlyRepayment: string
}

// Tạo hooks để đọc params từ URL
const { useParam } = createParam<LoanResultsScreenParams>()

// Hook tùy chỉnh để lấy và xử lý tất cả params cần thiết
export const useLoanResultsParams = (): LoanQueryParamsType => {
  const [loanAmount] = useParam('loanAmount')
  const [loanTerm] = useParam('loanTerm')
  const [loanType] = useParam('loanType')
  const [bankGroup] = useParam('bankGroup')
  const [bankId] = useParam('bankId')
  const [paymentMethod] = useParam('paymentMethod')
  const [earlyRepayment] = useParam('earlyRepayment')

  // Gom các params lại và chuyển đổi thành đúng định dạng
  // Đảm bảo tất cả giá trị null hoặc undefined được xử lý nhất quán
  const rawParams = {
    loanAmount: loanAmount === null ? undefined : loanAmount,
    loanTerm: loanTerm === null ? undefined : loanTerm,
    loanType: loanType === null ? undefined : loanType,
    bankGroup: bankGroup === null ? undefined : bankGroup,
    bankId: bankId === null ? undefined : bankId,
    paymentMethod: paymentMethod === null ? undefined : paymentMethod,
    earlyRepayment: earlyRepayment === null ? undefined : earlyRepayment,
  }

  // Parse và validate các params
  return parseQueryParams(rawParams)
}
