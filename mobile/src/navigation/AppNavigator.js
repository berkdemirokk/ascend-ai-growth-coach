import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PaywallScreen from '../screens/PaywallScreen';
import LessonScreen from '../screens/LessonScreen';
import PathScreen from '../screens/PathScreen';
import ReflectionsScreen from '../screens/ReflectionsScreen';
import InsightsScreen from '../screens/InsightsScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { useTranslation } from 'react-i18next';

const TAB_ICONS = {
  Home: 'auto-awesome',
  Insights: 'bar-chart',
  Profile: 'person',
};

function TabIcon({ name, focused, color }) {
  return (
    <MaterialIcons
      name={TAB_ICONS[name] || 'circle'}
      size={22}
      color={color}
      style={{ opacity: focused ? 1 : 0.5 }}
    />
  );
}

function MainTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D0D15',
          borderTopWidth: 1,
          borderTopColor: '#34343D',
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#C0C1FF',
        tabBarInactiveTintColor: '#6B6B85',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={PathScreen}
        options={{ title: t('nav.path', 'Path') }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ title: t('nav.insights', 'Stats') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('nav.profile', 'Profile') }}
      />
    </Tab.Navigator>
  );
}

function AuthLoading() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0B0B14',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator color="#6366F1" size="large" />
    </View>
  );
}

export default function AppNavigator() {
  const { onboarded } = useApp();
  const { isAuthenticated, guestMode, loading: authLoading } = useAuth();

  if (authLoading) {
    return <AuthLoading />;
  }

  const needsAuth = !isAuthenticated && !guestMode;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0B0B14' },
          animation: 'slide_from_right',
          animationDuration: 250,
        }}
      >
        {needsAuth ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
          </>
        ) : !onboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'fade' }} />
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ animation: 'fade' }} />
        )}
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="Lesson"
          component={LessonScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="Reflections"
          component={ReflectionsScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
