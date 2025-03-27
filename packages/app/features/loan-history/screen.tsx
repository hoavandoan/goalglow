import { useState, useEffect } from 'react'
import { YStack, XStack, H2, Paragraph, Separator, Spinner, Card, Button, ScrollView } from '@my/ui'
import { useRouter } from 'solito/navigation'
import { useLoanComparisons } from 'app/hooks/useBanks'
import { formatCurrency, formatMonthsToYears } from 'app/utils/format'
import { ChevronRight } from '@tamagui/lucide-icons'

/**
 * Màn hình hiển thị lịch sử tính toán khoản vay
 */
export function LoanHistoryScreen() {
  const router = useRouter()
  const { data: histories, isLoading, error } = useLoanComparisons()

  // Chuyển đến trang chi tiết khoản vay
  const handleViewDetail = (id: string) => {
    router.push({
      pathname: '/loan-results',
      query: { historyId: id },
    })
  }

  // Trở về trang tính toán khoản vay
  const handleCalculateNew = () => {
    router.replace('/loan-calculator')
  }

  // Nhóm lịch sử theo ngày
  const groupHistoriesByDate = () => {
    if (!histories) return {}

    const groups: Record<string, any[]> = {}

    histories.forEach((history) => {
      const date = new Date(history.created_at)
      const dateKey = date.toLocaleDateString('vi-VN')

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }

      groups[dateKey].push(history)
    })

    return groups
  }

  const groupedHistories = groupHistoriesByDate()

  return (
    <YStack flex={1} p="$4" space="$4">
      <H2>Lịch sử tính toán</H2>
      <Separator />

      {isLoading ? (
        <YStack height={300} justifyContent="center" alignItems="center">
          <Spinner size="large" />
          <Paragraph mt="$4">Đang tải dữ liệu...</Paragraph>
        </YStack>
      ) : error ? (
        <YStack height={300} justifyContent="center" alignItems="center">
          <Paragraph color="$red10">Đã xảy ra lỗi khi tải dữ liệu.</Paragraph>
          <Button theme="gray" size="$4" marginTop="$4" onPress={() => window.location.reload()}>
            Thử lại
          </Button>
        </YStack>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack space="$4">
            {Object.entries(groupedHistories).length > 0 ? (
              Object.entries(groupedHistories).map(([date, items]) => (
                <YStack key={date} space="$2">
                  <Paragraph fontWeight="bold" marginBottom="$2">
                    {date}
                  </Paragraph>
                  {items.map((item) => (
                    <Card
                      key={item.id}
                      p="$4"
                      pressStyle={{ backgroundColor: '$gray2' }}
                      onPress={() => handleViewDetail(item.id)}
                    >
                      <XStack justifyContent="space-between" alignItems="center">
                        <YStack space="$1" flex={1}>
                          <Paragraph fontWeight="bold">
                            {item.bank_name || 'Ngân hàng không xác định'}
                          </Paragraph>
                          <Paragraph fontSize="$3">
                            {formatCurrency(item.loan_amount)} VND •{' '}
                            {formatMonthsToYears(item.tenure_months)}
                          </Paragraph>
                          <Paragraph fontSize="$3" color="$green10">
                            Tổng chi phí: {formatCurrency(item.total_cost)} VND
                          </Paragraph>
                        </YStack>
                        <ChevronRight color="$gray9" />
                      </XStack>
                    </Card>
                  ))}
                </YStack>
              ))
            ) : (
              <YStack height={300} justifyContent="center" alignItems="center">
                <Paragraph>Chưa có lịch sử tính toán.</Paragraph>
                <Button theme="green" size="$4" marginTop="$4" onPress={handleCalculateNew}>
                  Tính toán ngay
                </Button>
              </YStack>
            )}
          </YStack>
        </ScrollView>
      )}
    </YStack>
  )
}
