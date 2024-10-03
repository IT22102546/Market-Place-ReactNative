import { View, Text, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';

export default function Categories({ categoryList }) {
  const navigation = useNavigation();

  return (
    <ScrollView style={tw`mt-1`} accessible={true} accessibilityLabel="Categories section">
      <Text style={tw`font-bold text-xl mb-4`} accessible={true} accessibilityRole="header">
        Categories
      </Text>
      <FlatList
        data={categoryList}
        numColumns={4}
        keyExtractor={(item, index) => index.toString()} // Added a key extractor for better list rendering
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={tw`flex-1 items-center justify-center p-2 border border-orange-200 m-1 h-20 rounded-lg bg-white`}
            onPress={() =>
              navigation.navigate('item-list', {
                category: item.name,
              })
            }
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Category ${item.name}`}
          >
            <Image
              source={{ uri: item.icon }}
              style={tw`w-10 h-10`}
              accessible={true}
              accessibilityLabel={`${item.name} icon`}
            />
            <Text style={tw`text-xs mt-1`} accessible={true}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
}
