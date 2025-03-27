import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { loanResults } = await req.json()

    if (!loanResults || !Array.isArray(loanResults) || loanResults.length === 0) {
      return NextResponse.json({ error: 'Invalid loan results data' }, { status: 400 })
    }

    // Tìm khoản vay tốt nhất (chi phí thấp nhất)
    const bestLoan = loanResults.reduce((prev, current) =>
      prev.totalCost < current.totalCost ? prev : current
    )

    // Tìm khoản vay tồi nhất (chi phí cao nhất)
    const worstLoan = loanResults.reduce((prev, current) =>
      prev.totalCost > current.totalCost ? prev : current
    )

    // Tính sự chênh lệch
    const difference = worstLoan.totalCost - bestLoan.totalCost
    const percentageDifference = (difference / bestLoan.totalCost) * 100

    // Tạo prompt cho OpenAI
    const prompt = `
    Phân tích chi tiết các khoản vay sau đây và đưa ra lời khuyên:
    
    Khoản vay tốt nhất:
    - Ngân hàng: ${bestLoan.bankName}
    - Lãi suất: ${bestLoan.interestRate}%
    - Tổng chi phí: ${bestLoan.totalCost.toLocaleString()} VND
    - Tổng tiền lãi: ${bestLoan.totalInterest.toLocaleString()} VND
    - Khoản trả hàng tháng: ${bestLoan.monthlyPayment.toLocaleString()} VND
    
    Khoản vay tồi nhất:
    - Ngân hàng: ${worstLoan.bankName}
    - Lãi suất: ${worstLoan.interestRate}%
    - Tổng chi phí: ${worstLoan.totalCost.toLocaleString()} VND
    - Tổng tiền lãi: ${worstLoan.totalInterest.toLocaleString()} VND
    - Khoản trả hàng tháng: ${worstLoan.monthlyPayment.toLocaleString()} VND
    
    Chênh lệch chi phí: ${difference.toLocaleString()} VND (${percentageDifference.toFixed(2)}%)
    
    Số lượng ngân hàng so sánh: ${loanResults.length}
    
    Viết một phân tích ngắn gọn bằng tiếng Việt, khoảng 250 từ. Phân tích nên bao gồm:
    1. So sánh giữa khoản vay tốt nhất và tồi nhất
    2. Tại sao khoản vay tốt nhất lại có lợi hơn
    3. Lời khuyên tài chính cho người vay
    4. Các yếu tố khác cần xem xét khi chọn khoản vay
    
    Hãy viết với giọng điệu chuyên nghiệp, dễ hiểu và hữu ích cho người đọc không chuyên về tài chính.
    `

    // Gọi OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Bạn là một chuyên gia tài chính, chuyên phân tích các khoản vay và đưa ra lời khuyên hữu ích.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 700,
    })

    const analysis = response.choices[0].message.content

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Error analyzing loan data:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi phân tích dữ liệu khoản vay' },
      { status: 500 }
    )
  }
}
