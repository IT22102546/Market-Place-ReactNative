import { View, Text, FlatList, Image } from 'react-native';
import React from 'react';
import tw from 'twrnc';

export default function Slider({ sliderList }) {
  return (
    <View style={tw`mt-5`} accessible={true} accessibilityLabel="Image slider section">
      <FlatList
        data={sliderList}
        horizontal={true}
        keyExtractor={(item, index) => index.toString()} // Added key extractor for better list rendering
        renderItem={({ item, index }) => (
          <View style={tw`mr-3`}>
            <Image
              source={{ uri: item?.image }}
              style={tw`h-50 w-80 rounded-xl`}
              resizeMode="contain"
              accessible={true}
              accessibilityLabel={`Slide ${index + 1}`}
            />
          </View>
        )}
        showsHorizontalScrollIndicator={false} // Hide scroll bar for a cleaner look
      />
    </View>
  );
}
