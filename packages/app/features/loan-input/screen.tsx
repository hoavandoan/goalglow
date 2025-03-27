import { useState } from 'react'
import { Button, YStack, XStack, H2, Form, Separator, Spinner } from '@my/ui'
import { CurrencyInput } from '@my/ui/src/currency-input'
import { DropdownSelect } from '@my/ui/src/dropdown-select'
import { useRouter } from 'solito/navigation'
import { z } from 'zod'
import { useBankGroups, useBanks } from 'app/hooks/useBanks'
import { BankGroupType, LoanTypeType, PaymentMethodType } from '@my/supabase'
import {
  LoanInputFormSchema,
  LoanInputFormType,
  loanTermOptions,
  loanTypeOptions,
  paymentMethodOptions,
  earlyRepaymentOptions,
} from 'app/validators/loan'

/**
 * Màn hình nhập thông tin khoản vay
 */
export function LoanInputScreen() {
  const router = useRouter()

  // State cho form
  const [loanAmount, setLoanAmount] = useState(500000000)
  const [loanTerm, setLoanTerm] = useState('60')
  const [loanType, setLoanType] = useState<LoanTypeType>('home_loan')
  const [bankGroup, setBankGroup] = useState<BankGroupType>('state_owned')
  const [bankId, setBankId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('reducing_balance')
  const [earlyRepayment, setEarlyRepayment] = useState('0')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Fetch dữ liệu từ API
  const { data: bankGroups, isLoading: isLoadingGroups } = useBankGroups()
  const { data: banks, isLoading: isLoadingBanks } = useBanks(bankGroup)

  // Hàm xử lý thay đổi loại vay
  const handleLoanTypeChange = (value: string) => {
    setLoanType(value as LoanTypeType)
  }

  // Hàm xử lý thay đổi phương thức trả nợ
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as PaymentMethodType)
  }

  // Xử lý submit form
  const handleSubmit = () => {
    try {
      // Tạo dữ liệu form để validate
      const formData: LoanInputFormType = {
        loanAmount,
        loanTerm,
        loanType,
        bankGroup,
        bankId,
        paymentMethod,
        earlyRepayment,
      }

      // Validate với schema từ validators
      LoanInputFormSchema.parse(formData)

      setIsLoading(true)

      // Chuyển dữ liệu đến trang kết quả sử dụng URL query params
      router.push({
        pathname: '/loan-results',
        query: {
          loanAmount: loanAmount.toString(),
          loanTerm,
          loanType,
          bankGroup,
          bankId,
          paymentMethod,
          earlyRepayment,
        },
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path) {
            errorMap[err.path[0]] = err.message
          }
        })
        setErrors(errorMap)
      }
    }
  }

  return (
    <YStack flex={1} p="$4" space="$4">
      <H2>Nhập thông tin khoản vay</H2>
      <Separator />

      <Form onSubmit={handleSubmit}>
        <YStack space="$4">
          <CurrencyInput
            label="Số tiền vay"
            value={loanAmount}
            onChange={setLoanAmount}
            error={errors.loanAmount}
          />

          <DropdownSelect
            label="Thời hạn vay"
            items={loanTermOptions}
            value={loanTerm}
            onValueChange={setLoanTerm}
            error={errors.loanTerm}
          />

          <DropdownSelect
            label="Loại hình vay"
            items={loanTypeOptions}
            value={loanType}
            onValueChange={handleLoanTypeChange}
            error={errors.loanType}
          />

          <DropdownSelect
            label="Nhóm ngân hàng"
            items={bankGroups?.map((g) => ({ value: g.id, label: g.name })) || []}
            value={bankGroup}
            onValueChange={(value) => {
              setBankGroup(value as BankGroupType)
              setBankId('')
            }}
            isLoading={isLoadingGroups}
            error={errors.bankGroup}
          />

          <DropdownSelect
            label="Ngân hàng"
            items={banks?.map((b) => ({ value: b.id, label: b.name })) || []}
            value={bankId}
            onValueChange={setBankId}
            isLoading={isLoadingBanks}
            error={errors.bankId}
          />

          <DropdownSelect
            label="Phương thức trả nợ"
            items={paymentMethodOptions}
            value={paymentMethod}
            onValueChange={handlePaymentMethodChange}
            error={errors.paymentMethod}
          />

          <DropdownSelect
            label="Trả nợ trước hạn"
            items={earlyRepaymentOptions}
            value={earlyRepayment}
            onValueChange={setEarlyRepayment}
            error={errors.earlyRepayment}
          />

          <Form.Trigger asChild disabled={isLoading}>
            <Button
              theme="green"
              size="$5"
              style={{ marginTop: 16, marginBottom: 16 }}
              icon={isLoading ? <Spinner /> : undefined}
            >
              Tính toán
            </Button>
          </Form.Trigger>
        </YStack>
      </Form>
    </YStack>
  )
}
