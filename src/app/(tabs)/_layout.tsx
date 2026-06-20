import { Icon, type IconName } from '@/components/Icon'
import { AppText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { Tabs } from 'expo-router'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function TabIcon({ name, label, focused }: { name: IconName; label: string; focused: boolean }) {
  const { colors } = useTheme()
  const color = focused ? colors.text : colors.mutedSoft
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 3, width: 76, paddingTop: 8 }}>
      <Icon name={name} size={22} color={color} strokeWidth={focused ? 2 : 1.7} />
      <AppText size={10.5} weight={focused ? 'semibold' : 'medium'} color={color}>
        {label}
      </AppText>
    </View>
  )
}

export default function TabsLayout() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: (props) => (
          <Pressable
            onPress={props.onPress}
            onLongPress={props.onLongPress}
            accessibilityState={props.accessibilityState}
            accessibilityLabel={props.accessibilityLabel}
            testID={props.testID}
            android_ripple={{ color: colors.border, borderless: false }}
            style={[props.style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
          >
            {props.children}
          </Pressable>
        ),
        tabBarStyle: {
          backgroundColor: colors.screen,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingTop: 4,
          paddingBottom: insets.bottom,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon name="upload" label="Upload" focused={focused} /> }} />
      <Tabs.Screen name="uploads" options={{ tabBarIcon: ({ focused }) => <TabIcon name="folder" label="My uploads" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon name="settings" label="Profile" focused={focused} /> }} />
    </Tabs>
  )
}
