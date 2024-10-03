import { StatusBar } from 'expo-status-bar';
import { Text, View, SafeAreaView } from 'react-native';
import LoginScreen from './Apps/Screen/LoginScreen';
import { ClerkProvider, SignedOut, SignedIn } from '@clerk/clerk-expo';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigation from './Apps/Navigations/TabNavigation';

export default function App() {
  return (
    <ClerkProvider publishableKey='pk_test_d2FudGVkLWdyYWNrbGUtNjkuY2xlcmsuYWNjb3VudHMuZGV2JA'>
      {/* Wrap the entire app in SafeAreaView to prevent content from going under the status bar */}
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar translucent backgroundColor="white" style="dark" />


        <SignedIn>
          <NavigationContainer>
            <TabNavigation />
          </NavigationContainer>
        </SignedIn>

        <SignedOut>
          <LoginScreen />
        </SignedOut>
      </SafeAreaView>
    </ClerkProvider>
  );
}
