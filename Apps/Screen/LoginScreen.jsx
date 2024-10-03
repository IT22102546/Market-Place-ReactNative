import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useWamUpBrowser } from '../../hooks/useWarmUpBrowser';
import { useOAuth } from '@clerk/clerk-expo';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  useWamUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        // Handle signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  }, []);

  return (
    <View className="flex-1 bg-white">
      {/* Login Image */}
      <Image
        source={require('./../../assets/images/loginimage.jpg')}
        className="w-full h-[300px] object-cover"
        accessible={true}
        accessibilityLabel="Login screen background image"
      />

      {/* Content Section */}
      <View className="p-7 bg-white mt-[-20px] rounded-t-3xl shadow-md">
        <Text
          className="text-[35px] font-bold text-center"
          accessible={true}
          accessibilityLabel="Online Market Place header"
        >
          Online Market Place
        </Text>
        
        <Text
          className="text-[18px] text-slate-400 mt-7 text-center"
          accessible={true}
          accessibilityLabel="Buy everything you need online and get it delivered to your doorsteps"
        >
          Buy everything you need online and get your items delivered to your doorsteps
        </Text>
        
        {/* Get Started Button */}
        <TouchableOpacity
          onPress={onPress}
          className="p-3 bg-orange-600 rounded-full mt-28"
          accessible={true}
          accessibilityLabel="Get started with Google sign-in"
        >
          <Text className="text-center text-white text-[18px]">Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
