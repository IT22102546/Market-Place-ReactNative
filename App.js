import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, View } from 'react-native';
import LoginScreen from './Apps/Screen/LoginScreen';
import { ClerkProvider, SignedOut, SignedIn } from '@clerk/clerk-expo';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigation from './Apps/Navigations/TabNavigation';
import VoiceCommandApp from './Apps/Components/voice/StartVoiceCommand'; // Import the new VoiceCommand component

export default function App() {
  return (
    <ClerkProvider publishableKey='pk_test_d2FudGVkLWdyYWNrbGUtNjkuY2xlcmsuYWNjb3VudHMuZGV2JA'>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar translucent backgroundColor="white" style="dark" />
        <SignedIn>
          <NavigationContainer>
            <TabNavigation />
            {/* Add the VoiceCommandApp component here */}
            <VoiceCommandApp />
          </NavigationContainer>
        </SignedIn>
        <SignedOut>
          <LoginScreen />
        </SignedOut>
      </SafeAreaView>
    </ClerkProvider>
  );
}

// import React from 'react';
// import { SafeAreaView, StyleSheet, Platform, ActivityIndicator } from 'react-native';
// import { WebView } from 'react-native-webview'; // Import WebView

// export default function App() {
//   const [loading, setLoading] = React.useState(true); // Track loading state

//   return (
//     <SafeAreaView style={styles.container}>
//       {loading && <ActivityIndicator size="large" color="#0000ff" />}  {/* Show loading spinner */}
//       <WebView
//         source={{ uri: 'http://localhost:8081/' }}  // Replace with the URL of your deployed web app
//         style={styles.webView}
//         startInLoadingState={true}  // Shows loading state until web content is ready
//         javaScriptEnabled={true}    // Enable JavaScript
//         domStorageEnabled={true}    // Enable DOM storage
//         allowsInlineMediaPlayback={true}  // Allow inline media playback
//         onLoadEnd={() => setLoading(false)}  // Hide loading spinner when web page is fully loaded
//         originWhitelist={['*']}  // Allow any origin to load in the WebView
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     marginTop: Platform.OS === 'android' ? 25 : 0,  // Adjust for Android status bar
//   },
//   webView: {
//     flex: 1,
//   },
// });
