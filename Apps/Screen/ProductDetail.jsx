import { View, Text, Image, TouchableOpacity, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native'
import { ScrollView } from 'react-native-gesture-handler';

export default function ProductDetail() {
    const{params}= useRoute();
    const [product,setProduct]=useState([]);
    useEffect(()=>{
        params&&setProduct(params.product)
    },[params]);

    const sendEmailMessage = ()=>{
        const subject = 'Regarding '+product.title;
        const body = 'Hi'+product.userName +'\n'+'I am interest about this product';
        Linking.openURL('mailto:'+product.userEmail+"?subject"+subject+"&body"+body);
    }
  return (
    <ScrollView className="bg-white">
      <Image source={{uri:product.image}}
        className="h-[320px] w-full " 
      />
      <View className="p-3">
        <Text className="text-[20px] font-bold">{product?.title}</Text>
        <View className="items-baseline">
            <Text className="p-1 px-2 mt-2 rounded-full bg-blue-200 text-blue-500">{product.category}</Text>
        </View>
       
        <Text className="mt-3 font-bold text-[20px]">Description</Text>
        <Text className="text-[14px]">{product?.desc}</Text>
      </View>

      <View className="p-3 flex flex-row gap-3 items-center bg-blue-100 border-gray-400" >
        <Image source={{uri:product.userImage}} className="w-12 h-12 rounded-full"/>
        <View>
            <Text className="font-bold text-[18px]">{product.userName}</Text>
            <Text className="text-gray-500">{product.userEmail}</Text>
        </View>
        
      </View>
      <TouchableOpacity
        onPress={()=>sendEmailMessage()}
        className="z-40 bg-blue-500 rounded-full  p-4 m-2">
            <Text className="text-center text-white">Send Message</Text>
        </TouchableOpacity>
    </ScrollView>
  )
}