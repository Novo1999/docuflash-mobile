import { useTheme } from '@/theme/ThemeProvider'
import type { ReactNode } from 'react'
import { View, type ViewStyle } from 'react-native'

export function Card({
  children,
  style,
  padding = 14,
  elevated = true,
}: {
  children: ReactNode
  style?: ViewStyle
  padding?: number
  elevated?: boolean
}) {
  const { colors, radii, mode } = useTheme()
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.lg + 2,
          borderCurve: 'continuous',
          padding,
        },
        elevated && mode === 'light' ? { boxShadow: '0 3px 10px rgba(15, 28, 46, 0.04)' } : null,
        style,
      ]}
    >
      {children}
    </View>
  )
}
