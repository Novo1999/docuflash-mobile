import { Icon, type IconName } from '@/components/Icon'
import { AppText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { Tabs } from 'expo-router'
import { View } from 'react-native'

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
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.screen,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 84,
          paddingTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="upload" label="Upload" focused={focused} /> }}
      />
      <Tabs.Screen
        name="uploads"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="folder" label="My uploads" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="settings" label="Profile" focused={focused} /> }}
      />
    </Tabs>
  )
}
