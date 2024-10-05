import { View, Text, FlatList } from 'react-native';
import React from 'react';
import PostItem from './PostItem';
import tw from 'twrnc';

export default function LatestItemList({ latestItemList, heading }) {
  return (
    <View style={tw``} accessible={true} accessibilityLabel={`${heading} section`}>
      <Text style={tw`font-bold text-xl mb-4 mt-3`} accessible={true} accessibilityRole="header">
        {heading}
      </Text>
      <FlatList
        data={latestItemList}
        numColumns={2}
        keyExtractor={(item, index) => index.toString()} // Added a key extractor for better performance
        renderItem={({ item, index }) => (
          <PostItem
            item={item}
            accessible={true}
            accessibilityLabel={`Latest item: ${item.name}`}
          />
        )}
        contentContainerStyle={tw`gap-2`} // Added some spacing between items
      />
    </View>
  );
}
