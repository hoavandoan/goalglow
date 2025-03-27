import React from 'react'
import { YStack, Text, H1 } from '@my/ui'
import { LoanInputScreen } from '../loan-input/screen'

export function LoanCalculatorScreen() {
  return (
    <YStack f={1} jc="center" ai="center" space>
      <LoanInputScreen />
    </YStack>
  )
}
