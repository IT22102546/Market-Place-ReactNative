import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';

export default function PostItem({ item }) {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;

  return (
    <TouchableOpacity
      style={tw`flex-1 m-2 p-2 rounded-lg border border-gray-100`}
      onPress={() =>
        navigation.push('product-detail', {
          product: item,
        })
      }
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Product ${item.title} for Rs. ${item.price}, in category ${item.category}`}
    >
      {/* Product Image */}
      <Image
        source={{ uri: item.image }}
        style={[
          tw`w-full rounded-lg`, 
          { height: screenWidth * 0.5 } // Make height responsive based on screen width
        ]}
        resizeMode="cover" // Ensures the image fills the container
        accessible={true}
        accessibilityLabel={`${item.title} image`}
      />

      {/* Product Details */}
      <View style={tw`mt-2`}>
        <Text style={tw`font-bold text-base`} accessible={true}>
          {item.title}
        </Text>
        <Text style={tw`font-bold text-lg text-orange-600`} accessible={true}>
          Rs.{item.price}.00
        </Text>
        <Text
          style={tw`p-2 text-white font-semibold bg-orange-600 rounded-full text-xs w-24 text-center mt-1`}
          accessible={true}
          accessibilityLabel={`Category ${item.category}`}
        >
          {item.category}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
