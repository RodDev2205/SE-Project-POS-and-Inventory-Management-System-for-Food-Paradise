import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { View, StyleSheet, Platform } from 'react-native';

function TabBarIcon({
  name,
  color,
  size,
  focused,
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Feather name={name} size={size} color={color} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.textOnGreen,
        tabBarInactiveTintColor: '#cfe6cf',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon name="home" color={color} size={size} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon name="activity" color={color} size={size} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon name="message-circle" color={color} size={size} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon name="box" color={color} size={size} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon name="user" color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.primaryGreenDark,
    borderTopWidth: 1,
    borderTopColor: Colors.primaryGreen,
    height: Platform.OS === 'android' ? 64 : 52,
    paddingBottom: Platform.OS === 'android' ? 10 : 6,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
    height: 32,
    borderRadius: 999,
  },
  iconWrapActive: {
    backgroundColor: Colors.primaryGreen,
  },
});
