import { useTheme } from '@/theme/ThemeProvider'
import type { ReactNode } from 'react'
import { View, type ViewStyle } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'

type ScreenProps = {
  children: ReactNode
  scroll?: boolean
  edges?: Edge[]
  contentStyle?: ViewStyle
  padded?: boolean
}

export function Screen({
  children,
  scroll = false,
  edges = ['top', 'bottom'],
  contentStyle,
  padded = true,
}: ScreenProps) {
  const { colors } = useTheme()
  const padding: ViewStyle = padded ? { paddingHorizontal: 22 } : {}

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={edges}>
      {scroll ? (
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ flexGrow: 1, paddingBottom: 24 }, padding, contentStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          bottomOffset={24}
        >
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <View style={[{ flex: 1 }, padding, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  )
}
