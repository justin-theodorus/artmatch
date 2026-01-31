import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { StyleSheet } from 'react-native'

// Import screens
import SwipeScreen from './src/screens/SwipeScreen'
import GalleryScreen from './src/screens/GalleryScreen'
import ChatScreen from './src/screens/ChatScreen'
import CollectionScreen from './src/screens/CollectionScreen'
import OnboardingScreen from './src/screens/OnboardingScreen'
import ArtworkDetailScreen from './src/screens/ArtworkDetailScreen'
import ARPreviewScreen from './src/screens/ARPreviewScreen'
import GalleryProfileScreen from './src/screens/GalleryProfileScreen'

import { useUserStore } from './src/store/userStore'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function MainTabs () {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false
      }}
    >
      <Tab.Screen 
        name="Discover" 
        component={SwipeScreen}
        options={{
          tabBarLabel: 'Discover'
        }}
      />
      <Tab.Screen 
        name="Galleries" 
        component={GalleryScreen}
        options={{
          tabBarLabel: 'Galleries'
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          tabBarLabel: 'AI Chat'
        }}
      />
      <Tab.Screen 
        name="Collections" 
        component={CollectionScreen}
        options={{
          tabBarLabel: 'Collections'
        }}
      />
    </Tab.Navigator>
  )
}

function AppNavigator () {
  const user = useUserStore((state) => state.user)
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true
      }}
    >
      {!user?.onboarding_completed ? (
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      ) : null}
      <Stack.Screen 
        name="Main" 
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ArtworkDetail" 
        component={ArtworkDetailScreen}
        options={{ title: 'Artwork Details' }}
      />
      <Stack.Screen 
        name="ARPreview" 
        component={ARPreviewScreen}
        options={{ title: 'AR Preview' }}
      />
      <Stack.Screen 
        name="GalleryProfile" 
        component={GalleryProfileScreen}
        options={{ title: 'Gallery' }}
      />
    </Stack.Navigator>
  )
}

export default function App () {
  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})
