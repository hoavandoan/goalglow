import { useState } from 'react'
import { ScrollView, XStack, YStack, Text, Button } from 'tamagui'
import { ChevronUp, ChevronDown } from '@tamagui/lucide-icons'

interface BankComparisonTableProps {
  data: Array<{
    bankId: string
    bankName: string
    collateralType: string
    fixedRate: number
    floatingRate: number
    fixedMonths: number
    monthlyPaymentFixed: number
    monthlyPaymentFloating: number
    totalInterest: number
    earlyRepaymentFeeAmount: number
    totalCost: number
  }>
}

type SortFields =
  | 'bankName'
  | 'collateralType'
  | 'fixedRate'
  | 'floatingRate'
  | 'monthlyPaymentFixed'
  | 'monthlyPaymentFloating'
  | 'totalInterest'
  | 'earlyRepaymentFeeAmount'
  | 'totalCost'

/**
 * Component hiển thị bảng so sánh các ngân hàng
 */
export function BankComparisonTable({ data }: BankComparisonTableProps) {
  const [sortField, setSortField] = useState<SortFields>('totalCost')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: SortFields) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return sortDirection === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number)
  })

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(num))
  }

  return (
    <YStack>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <YStack>
          {/* Header */}
          <XStack backgroundColor="#f5f5f5" padding="$2">
            <XStack width={120} alignItems="center">
              <Button variant="outlined" onPress={() => handleSort('bankName')}>
                <Text fontWeight="bold">Ngân hàng</Text>
                <SortIcon field="bankName" />
              </Button>
            </XStack>
            <XStack width={100} alignItems="center">
              <Button variant="outlined" onPress={() => handleSort('collateralType')}>
                <Text fontWeight="bold">Hình thức</Text>
                <SortIcon field="collateralType" />
              </Button>
            </XStack>
            <XStack width={80} alignItems="center">
              <Button variant="outlined" onPress={() => handleSort('fixedRate')}>
                <Text fontWeight="bold">LS ưu đãi</Text>
                <SortIcon field="fixedRate" />
              </Button>
            </XStack>
            <XStack width={80} alignItems="center">
              <Button variant="outlined" onPress={() => handleSort('floatingRate')}>
                <Text fontWeight="bold">LS thả nổi</Text>
                <SortIcon field="floatingRate" />
              </Button>
            </XStack>
            <XStack width={120} alignItems="center">
              <Button variant="outlined" onPress={() => handleSort('monthlyPaymentFixed')}>
                <Text fontWeight="bold">Trả/tháng (ưu đãi)</Text>
                <SortIcon field="monthlyPaymentFixed" />
              </Button>
            </XStack>
            <XStack width={120} alignItems="center">
              <Button variant="outlined" onPress={() => handleSort('monthlyPaymentFloating')}>
                <Text fontWeight="bold">Trả/tháng (thả nổi)</Text>
                <SortIcon field="monthlyPaymentFloating" />
              </Button>
            </XStack>
            <XStack width={120} alignItems="center">
              <Button variant="outlined" onPress={() => handleSort('totalInterest')}>
                <Text fontWeight="bold">Tổng lãi</Text>
                <SortIcon field="totalInterest" />
              </Button>
            </XStack>
            <XStack width={100} alignItems="center">
              <Button variant="outlined" onPress={() => handleSort('earlyRepaymentFeeAmount')}>
                <Text fontWeight="bold">Phí phạt</Text>
                <SortIcon field="earlyRepaymentFeeAmount" />
              </Button>
            </XStack>
            <XStack width={120} alignItems="center">
              <Button variant="outlined" onPress={() => handleSort('totalCost')}>
                <Text fontWeight="bold">Tổng chi phí</Text>
                <SortIcon field="totalCost" />
              </Button>
            </XStack>
          </XStack>

          {/* Rows */}
          {sortedData.map((item, index) => {
            const isLowestCost = index === 0
            return (
              <XStack
                key={`${item.bankId}-${item.collateralType}`}
                backgroundColor={
                  isLowestCost ? '#e6f2eb' : index % 2 === 0 ? '#f9f9f9' : 'transparent'
                }
                padding="$2"
                borderLeftWidth={isLowestCost ? 4 : 0}
                borderLeftColor="#227a60"
              >
                <XStack width={120} alignItems="center">
                  <Text fontWeight={isLowestCost ? 'bold' : 'normal'}>{item.bankName}</Text>
                </XStack>
                <XStack width={100} alignItems="center">
                  <Text>{item.collateralType === 'tin_chap' ? 'Tín chấp' : 'Thế chấp'}</Text>
                </XStack>
                <XStack width={80} alignItems="center">
                  <Text>{item.fixedRate.toFixed(2)}%</Text>
                </XStack>
                <XStack width={80} alignItems="center">
                  <Text>{item.floatingRate.toFixed(2)}%</Text>
                </XStack>
                <XStack width={120} alignItems="center">
                  <Text>{formatNumber(item.monthlyPaymentFixed)}</Text>
                </XStack>
                <XStack width={120} alignItems="center">
                  <Text>{formatNumber(item.monthlyPaymentFloating)}</Text>
                </XStack>
                <XStack width={120} alignItems="center">
                  <Text>{formatNumber(item.totalInterest)}</Text>
                </XStack>
                <XStack width={100} alignItems="center">
                  <Text>{formatNumber(item.earlyRepaymentFeeAmount)}</Text>
                </XStack>
                <XStack width={120} alignItems="center">
                  <Text fontWeight={isLowestCost ? 'bold' : 'normal'}>
                    {formatNumber(item.totalCost)}
                  </Text>
                </XStack>
              </XStack>
            )
          })}

          {sortedData.length === 0 && (
            <XStack paddingVertical="$8" style={{ justifyContent: 'center' }} width={800}>
              <Text>Không tìm thấy kết quả phù hợp.</Text>
            </XStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
