import { Paragraph, H3, YStack, Text, Spinner, Card } from 'tamagui'

interface AIAnalysisProps {
  text: string
  loading?: boolean
  errorMessage?: string | null
}

/**
 * Component hiển thị phân tích AI
 */
export function AIAnalysis({ text, loading = false, errorMessage = null }: AIAnalysisProps) {
  if (loading) {
    return (
      <Card p="$4" bordered>
        <YStack style={{ alignItems: 'center', justifyContent: 'center' }} space="$2">
          <Spinner size="large" color="$blue10" />
          <Paragraph>Đang phân tích dữ liệu...</Paragraph>
        </YStack>
      </Card>
    )
  }

  if (errorMessage) {
    return (
      <Card p="$4" bordered>
        <YStack space="$2">
          <H3 color="$red10">Lỗi phân tích</H3>
          <Paragraph>{errorMessage}</Paragraph>
        </YStack>
      </Card>
    )
  }

  // Xử lý nội dung từ AI để hiển thị theo định dạng Markdown đơn giản
  const formatAIContent = (content: string) => {
    // Tách các đoạn theo dòng mới
    const paragraphs = content.split('\n').filter((p) => p.trim().length > 0)

    return (
      <Card bordered p="$4">
        <YStack space="$2">
          {paragraphs.map((paragraph, idx) => {
            // Xử lý tiêu đề
            if (paragraph.startsWith('# ')) {
              return (
                <H3 key={idx} size="$7">
                  {paragraph.replace(/^# /, '')}
                </H3>
              )
            }

            if (paragraph.startsWith('## ')) {
              return (
                <H3 key={idx} size="$5" color="$green10">
                  {paragraph.replace(/^## /, '')}
                </H3>
              )
            }

            // Xử lý gạch đầu dòng
            if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
              return (
                <YStack key={idx} style={{ paddingLeft: '$2', flexDirection: 'row' }}>
                  <Text>•</Text>
                  <Paragraph style={{ paddingLeft: '$2' }}>
                    {paragraph.replace(/^[-*] /, '')}
                  </Paragraph>
                </YStack>
              )
            }

            // Xử lý văn bản thường
            return <Paragraph key={idx}>{paragraph}</Paragraph>
          })}
        </YStack>
      </Card>
    )
  }

  return formatAIContent(text)
}
