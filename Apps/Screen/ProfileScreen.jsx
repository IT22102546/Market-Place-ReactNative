import { View, Text, Image, FlatList, TouchableOpacity, Linking } from 'react-native';
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
  const {isLoaded,signOut}=useAuth();

  const menuList = [
    {
      id: 1,
      name: 'My Products',
      icon: myproduct,
      path: 'my-product'
    },
    {
      id: 2,
      name: 'Explore',
      icon: explore,
      path: 'explore-tab'
    },
    {
      id: 3,
      name: 'faITe',
      icon: link,
      url: 'https://faiteplus.com/'
    },
    {
      id: 4,
      name: 'My List',
      icon: link,
      path: 'my-list'
    },
    {
      id: 5,
      name: 'Log out',
      icon: logout
    }
  ];

  const onMenuPress = (item) => {
    if(item.name=='Log out'){

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
    <View className="p-5 bg-white flex-1">
      <View className="items-center mt-10">
        <Image source={{ uri: user.imageUrl }} className="w-[100px] h-[100px] rounded-full"/>
        <Text className="font-bold text-[20px] mt-2">{user?.fullName}</Text>
        <Text className="text-[18px] mt-2 text-gray-500">{user?.primaryEmailAddress?.emailAddress}</Text>
      </View>

      <FlatList
        data={menuList}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity className="p-3 flex-1 border-[1px] items-center m-4 rounded-lg border-blue-400 mx-2 mt-4"
            onPress={() => onMenuPress(item)}
          >
            {item.icon && (
              <Image source={item.icon} className="w-[50px] h-[50px]" />
            )}
            <Text className="text-[12px] text-blue-700 mt-3">{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
