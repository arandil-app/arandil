import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#1E293B',
        tabBarActiveTintColor: '#4F6AF5',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerTitle: 'Arandil',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progreso',
          headerTitle: 'Mi Progreso',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerTitle: 'Mi Perfil',
        }}
      />
    </Tabs>
  );
}
