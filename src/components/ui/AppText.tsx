import { useTheme } from '@/theme/ThemeProvider'
import { Text, type TextProps } from 'react-native'

type Variant = 'heading' | 'body'
type Weight = 'regular' | 'medium' | 'semibold' | 'bold'

export type AppTextProps = TextProps & {
  variant?: Variant
  weight?: Weight
  size?: number
  color?: string
  lineHeight?: number
  letterSpacing?: number
}

export function AppText({
  variant = 'body',
  weight = 'regular',
  size = 14,
  color,
  lineHeight,
  letterSpacing,
  style,
  ...rest
}: AppTextProps) {
  const { colors, fonts } = useTheme()

  const fontFamily =
    variant === 'heading'
      ? fonts.heading
      : weight === 'bold'
        ? fonts.bodyBold
        : weight === 'semibold'
          ? fonts.bodySemiBold
          : weight === 'medium'
            ? fonts.bodyMedium
            : fonts.body

  return (
    <Text
      style={[
        {
          fontFamily,
          fontSize: size,
          color: color ?? colors.text,
          ...(lineHeight ? { lineHeight } : {}),
          ...(letterSpacing !== undefined ? { letterSpacing } : {}),
        },
        style,
      ]}
      {...rest}
    />
  )
}
