import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

export default function PostItem({item}) {

    const navigation = useNavigation();
  return (
    <TouchableOpacity className="flex-1 m-2 p-2 rounded-lg border-[1px] border-slate-300 "
        onPress={()=>navigation.push('product-detail', {
            product:item
        })}
    >
            <Image 
              source={{ uri: item.image }} 
              className="w-full h-[140px] rounded-lg" 
              resizeMode="contain" 
            />
            <View>
              <Text className="font-bold text-[15px] mt-2">{item.title}</Text>
              <Text className="font-bold text-[20px] text-blue-600">Rs. {item.price}</Text>
              <Text className="text-blue-500 bg-blue-200 p-[2px] rounded-full px-1 text-[10px] w-[90px] text-center mt-1">{item.category}</Text>
            </View>
          </TouchableOpacity>
  )
}