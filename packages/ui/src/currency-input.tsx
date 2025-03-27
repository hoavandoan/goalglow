import { useState, useEffect } from 'react'
import { Input, Label, YStack, Text } from 'tamagui'
import { formatNumberWithCommas } from 'app/utils/format'

interface CurrencyInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  error?: string
}

/**
 * Component nhập số tiền với định dạng tiền tệ
 */
export function CurrencyInput({
  label,
  value,
  onChange,
  placeholder = '0',
  error,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState<string>('')

  // Cập nhật hiển thị khi value thay đổi
  useEffect(() => {
    if (value) {
      setDisplayValue(formatNumberWithCommas(value))
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleChangeText = (text: string) => {
    // Chỉ cho phép số và dấu phẩy
    const cleaned = text.replace(/[^0-9,]/g, '')
    setDisplayValue(cleaned)

    // Chuyển đổi về số
    const numericValue = parseInt(cleaned.replace(/,/g, ''), 10) || 0
    onChange(numericValue)
  }

  const handleBlur = () => {
    // Khi blur, format lại số
    if (value) {
      setDisplayValue(formatNumberWithCommas(value))
    }
  }

  return (
    <YStack space="$2">
      <Label htmlFor={label}>{label}</Label>
      <Input
        id={label}
        value={displayValue}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        placeholder={placeholder}
        keyboardType="numeric"
        suffix={<Text color="$color9">VND</Text>}
      />
      {error && (
        <Text color="$red10" size="$2">
          {error}
        </Text>
      )}
    </YStack>
  )
}
