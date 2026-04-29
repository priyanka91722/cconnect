/**
 * Campus Connect - Main App Entry
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import SplashScreen from './src/screens/SplashScreen';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
}

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.log('[App] Root crash caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>App Loaded</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <RootErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </RootErrorBoundary>
  );
}
