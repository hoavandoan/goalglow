/**
 * Định dạng số tiền theo chuẩn Việt Nam
 * @param amount Số tiền cần định dạng
 * @returns Chuỗi đã định dạng
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount))
}

/**
 * Định dạng số với dấu phẩy ngăn cách hàng nghìn
 * @param num Số cần định dạng
 * @returns Chuỗi đã định dạng
 */
export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Định dạng số thành phần trăm
 * @param value Giá trị cần định dạng
 * @returns Chuỗi đã định dạng
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

/**
 * Định dạng số tháng thành năm + tháng
 * @param months Số tháng
 * @returns Chuỗi đã định dạng
 */
export function formatMonthsToYears(months: number): string {
  if (months < 12) {
    return `${months} tháng`
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (remainingMonths === 0) {
    return `${years} năm`
  }

  return `${years} năm ${remainingMonths} tháng`
}
