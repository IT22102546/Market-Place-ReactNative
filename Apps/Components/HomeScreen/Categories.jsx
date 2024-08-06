import { View, Text, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

export default function Categories({categoryList}) {

  const navigation = useNavigation();
  return (
    <ScrollView className="mt-5">
      <Text className="font-bold text-[20px]">Categories</Text>
      <FlatList
        data={categoryList}
        numColumns={4}
        renderItem={({item,index})=>(
            <TouchableOpacity className="flex flex-1 items-center justify-center  p-2 border-[1px] border-gray-200 m-1 h-[80px] rounded-lg bg-blue-50"
              onPress={()=>navigation.navigate('item-list',{
                category:item.name
              })}
            >

                <Image source={{uri:item.icon}}
                    className="w-[40px] h-[40px]"
                />
                <Text className="text-[10px] mt-1">{item.name}</Text>
            </TouchableOpacity>
        )}
      />
    </ScrollView>
  )
}