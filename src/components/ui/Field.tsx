import { Icon, type IconName } from '@/components/Icon'
import { useTheme } from '@/theme/ThemeProvider'
import { useState } from 'react'
import { Pressable, TextInput, View, type TextInputProps } from 'react-native'
import { AppText } from './AppText'

type FieldProps = TextInputProps & {
  label?: string
  icon?: IconName
  secure?: boolean
  error?: string
}

export function Field({ label, icon, secure = false, error, style, ...rest }: FieldProps) {
  const { colors, radii, fonts } = useTheme()
  const [hidden, setHidden] = useState(secure)
  const hasValue = !!rest.value

  return (
    <View>
      {label ? (
        <AppText weight="semibold" size={11.5} color={colors.mutedSoft} style={{ marginBottom: 7 }}>
          {label}
        </AppText>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: colors.inputBg,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.borderStrong,
          borderRadius: radii.md,
          paddingHorizontal: 14,
          paddingVertical: 13,
        }}
      >
        {icon ? <Icon name={icon} size={16} color={colors.mutedSoft} strokeWidth={1.6} /> : null}
        <TextInput
          style={[
            { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.text, padding: 0 },
            secure && hidden && hasValue ? { letterSpacing: 4 } : null,
            style,
          ]}
          placeholderTextColor={colors.mutedSoft}
          secureTextEntry={hidden}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((v) => !v)} hitSlop={8}>
            <Icon name="eye" size={16} color={colors.mutedSoft} strokeWidth={1.6} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText size={11.5} color={colors.danger} style={{ marginTop: 6 }}>
          {error}
        </AppText>
      ) : null}
    </View>
  )
}
