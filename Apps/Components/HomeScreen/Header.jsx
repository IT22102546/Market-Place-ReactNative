import { View, Image, Text, TextInput, AccessibilityInfo } from 'react-native';
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
    <View accessible={true} accessibilityLabel="Header section">
      {/* User Welcome Section */}
      <View style={tw`flex flex-row items-center gap-2 mt-4`} accessible={true} accessibilityRole="header">
        <Image
          source={{ uri: user.imageUrl }}
          style={tw`rounded-full w-10 h-10 border-2 border-orange-600`}
          accessible={true}
          accessibilityLabel="Profile image"
        />
        <View>
          <Text style={tw`text-sm`} accessible={true}>
            Welcome
          </Text>
          <Text style={tw`text-lg font-bold`} accessible={true}>
            {user?.fullName}
          </Text>
        </View>
      </View>

      {/* Search Bar Section */}
      <View
        style={tw`p-1 bg-gray-50 rounded-lg px-5 mt-4 flex flex-row items-center border-4 border-orange-500`}
        accessible={true}
        accessibilityLabel="Search bar"
      >
        <Ionicons name="search" size={22} color="gray" accessible={false} />
        <TextInput
          placeholder="Search"
          style={tw`ml-2 text-base`}
          onChangeText={(value) => {
            console.log(value);
          }}
          accessible={true}
          accessibilityLabel="Search input"
        />
      </View>
    </View>
  );
}
