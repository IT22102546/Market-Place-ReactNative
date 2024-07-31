import { View, Image, Text, TextInput } from 'react-native';
import React from 'react';
import { useUser } from '@clerk/clerk-expo';
import tw from 'twrnc';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Header() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <View>
        <View className="flex flex-row items-center gap-2">
            <Image
                source={{ uri: user.imageUrl }}
                style={tw`rounded-full w-12 h-12`}
            />
            <View>
                <Text className="text-[14px]">Welcome</Text>
                <Text className="text-[16px] font-bold">{user?.fullName}</Text>
            </View>
        </View>

        <View className="p-2 bg-blue-50 rounded-full px-5 mt-4 flex flex-row items-center border-[2px] border-blue-200">
            <Ionicons name="search" size={24} color="gray" />
            <TextInput placeholder='Search' className="ml-2 text-[16px]  "
                onChangeText={(value)=>{
                    console.log(value);
                }}
            />
            
        </View>

    </View>
    
  );
}
