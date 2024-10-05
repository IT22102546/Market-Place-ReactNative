import { ScrollView, View, Text, Image, FlatList, TouchableOpacity, Linking, Dimensions } from 'react-native';
import React from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import myproduct from './../../assets/images/myproduct.jpg';
import link from './../../assets/images/link.jpg';
import explore from './../../assets/images/explore.png';
import logout from './../../assets/images/logout.jpg';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user } = useUser();
  const navigation = useNavigation();
  const { isLoaded, signOut } = useAuth();

  // Get screen width for responsive design
  const screenWidth = Dimensions.get('window').width;

  const menuList = [
    { id: 1, name: 'My Products', icon: myproduct, path: 'my-product' },
    { id: 2, name: 'Explore', icon: explore, path: 'explore-tab' },
    { id: 3, name: 'faITe', icon: link, url: 'https://faiteplus.com/' },
    { id: 4, name: 'My List', icon: link, path: 'my-list' },
    { id: 5, name: 'Log out', icon: logout }
  ];

  const onMenuPress = (item) => {
    if (item.name === 'Log out') {
      signOut();
      return;
    }
    if (item?.path) {
      navigation.navigate(item.path);
    } else if (item?.url) {
      Linking.openURL(item.url);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }} className="bg-white">
      <View className="p-5 flex-1 w-full items-center">
        {/* Profile Section */}
        <View className="items-center mt-10">
          <Image
            source={{ uri: user.imageUrl }}
            style={{ width: screenWidth * 0.3, height: screenWidth * 0.3, }} // Responsive image size
            className="mx-auto rounded-full border"
            accessible={true}
            accessibilityLabel="Profile picture"
          />
          <Text className="font-bold text-[20px] mt-2 text-center" accessible={true} accessibilityLabel={`User name: ${user?.fullName}`}>
            {user?.fullName}
          </Text>
          <Text className="text-[18px] mt-2 text-gray-500 text-center" accessible={true} accessibilityLabel={`Email address: ${user?.primaryEmailAddress?.emailAddress}`}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>

        {/* Menu List */}
        <View style={{ alignItems: 'center', width: '100%' }}>
          <FlatList
            data={menuList}
            keyExtractor={(item) => item.id.toString()}
            numColumns={screenWidth > 600 ? 4 : 3} // Change number of columns based on screen width
            contentContainerStyle={{ alignItems: 'center' }} // Center the FlatList items
            renderItem={({ item }) => (
              <TouchableOpacity
                className="p-3 items-center m-4 rounded-lg border-orange-600"
                style={{
                  borderWidth: 1,
                  width: screenWidth > 600 ? screenWidth / 5 : screenWidth / 4, // Adjust button width
                  alignSelf: 'center' // Center each item
                }}
                onPress={() => onMenuPress(item)}
                accessible={true}
                accessibilityLabel={`Navigate to ${item.name}`}
              >
                {item.icon && (
                  <Image
                    source={item.icon}
                    style={{
                      width: screenWidth * 0.12,
                      height: screenWidth * 0.12, // Responsive icon size
                    }}
                    accessible={true}
                    accessibilityLabel={`${item.name} icon`}
                  />
                )}
                <Text className="text-[12px] text-blue-700 mt-3 text-center">{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </ScrollView>
  );
}
