import { useState } from 'react'

/**
 * Hook để lấy phân tích AI cho kết quả so sánh khoản vay
 */
export function useAIAnalysis() {
  const [analysis, setAnalysis] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function analyzeLoans(loanResults: any[]) {
    if (!loanResults || loanResults.length === 0) {
      setError('Không có dữ liệu khoản vay để phân tích')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/analyze-loan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loanResults }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Lỗi khi phân tích khoản vay')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      return data.analysis
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    analysis,
    loading,
    error,
    analyzeLoans,
  }
}
