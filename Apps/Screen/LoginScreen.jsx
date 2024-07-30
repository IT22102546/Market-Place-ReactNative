import { View, Text, Image, Button, TouchableOpacity } from 'react-native'
import React from 'react'
import * as WebBrowser from 'expo-web-browser'
import { useWamUpBrowser } from '../../hooks/useWarmUpBrowser'
import { useOAuth } from '@clerk/clerk-expo'

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    useWamUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        setActive({ session: createdSessionId })
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error('OAuth error', err)
    }
  }, [])

  return (
    <View>
     <Image source={require('./../../assets/images/loginimage.jpg')}
        className="w-full h-[300px] object-cover"
     />
     <View className="p-7 bg-white mt-[-20px] rounded-t-3xl shadow-md">
        <Text className="text-[35px] font-bold text-center">Online Market Place</Text>
        <Text className="text-[18px] text-slate-400 mt-7 text-center"> Buy everything you need online and get your stuffs to your Door steps</Text>
        <TouchableOpacity onPress={onPress} className="p-3 bg-blue-500 rounded-full mt-28">
            <Text className="text-center text-white text-[18px] ">Get Started</Text>
        </TouchableOpacity>
     </View>
    </View>
  )
}