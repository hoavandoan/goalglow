import React, { useState } from 'react'
import { YStack, Select, Adapt, Sheet, Text, Label, ScrollView } from 'tamagui'
import { Check, ChevronDown } from '@tamagui/lucide-icons'

interface DropdownSelectProps {
  label: string
  items: Array<{ value: string; label: string }>
  value: string
  onValueChange: (value: string) => void
  error?: string
  isLoading?: boolean
}

/**
 * Component dropdown chọn giá trị
 */
export function DropdownSelect({
  label,
  items,
  value,
  onValueChange,
  error,
  isLoading = false,
}: DropdownSelectProps) {
  const [open, setOpen] = useState(false)

  const selectedItem = items.find((item) => item.value === value)

  return (
    <YStack space="$2">
      <Label htmlFor={label}>{label}</Label>
      <Select
        id={label}
        value={value}
        onValueChange={onValueChange}
        open={open}
        onOpenChange={setOpen}
      >
        <Select.Trigger disabled={isLoading} aria-label={label}>
          <Select.Value>{selectedItem?.label || 'Chọn giá trị'}</Select.Value>
          {isLoading ? (
            <YStack animation="quick" enterStyle={{ opacity: 0 }}>
              <ChevronDown />
            </YStack>
          ) : (
            <ChevronDown />
          )}
        </Select.Trigger>

        <Adapt when="sm" platform="touch">
          <Sheet
            modal
            dismissOnSnapToBottom
            snapPoints={[50]}
            position={open ? 0 : -1}
            onPositionChange={(position) => {
              if (position <= 0) setOpen(false)
            }}
          >
            <Sheet.Overlay />
            <Sheet.Frame>
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
          </Sheet>
        </Adapt>

        <Select.Content>
          <Select.ScrollUpButton />
          <Select.Viewport>
            <Select.Group>
              <Select.Label>{label}</Select.Label>
              {items.map((item, i) => (
                <Select.Item key={item.value} value={item.value} index={i}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton />
        </Select.Content>
      </Select>

      {error && <Text color="$red10">{error}</Text>}
    </YStack>
  )
}
