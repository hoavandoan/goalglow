import { Button, H1, Paragraph, YStack } from '@my/ui'
import { useLink } from 'solito/navigation'

/**
 * Màn hình chính của ứng dụng
 */
export function HomeScreen() {
  // Dùng useLink để điều hướng sang màn hình nhập liệu
  const linkProps = useLink({
    href: `/loan-calculator`,
  })

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" gap="$8" p="$4" bg="$background">
      {/* Logo ứng dụng */}
      <YStack
        width={120}
        height={120}
        borderRadius="$10"
        bg="$green5"
        justifyContent="center"
        alignItems="center"
      >
        <H1 color="$green10" size="$10">
          L$
        </H1>
      </YStack>

      {/* Tiêu đề và mô tả */}
      <YStack gap="$4" maxWidth={600} alignItems="center">
        <H1 textAlign="center" color="$green10">
          Lãi Suất Việt
        </H1>
        <Paragraph color="$color11" textAlign="center" size="$5">
          Tính toán & so sánh khoản vay dễ dàng
        </Paragraph>
      </YStack>

      {/* Nút bắt đầu */}
      <Button {...linkProps} theme="green" size="$6" minWidth={200}>
        Bắt đầu tính toán
      </Button>

      {/* Footer thông tin pháp lý */}
      <Paragraph size="$2" color="$color8" position="absolute" bottom="$4" textAlign="center">
        Dữ liệu tĩnh tháng 3/2025, liên hệ ngân hàng để xác nhận
      </Paragraph>
    </YStack>
  )
}
