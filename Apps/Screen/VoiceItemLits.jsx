import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import LatestItemList from '../Components/HomeScreen/LatestItemList';

export default function VoiceItemList() {
  const { params } = useRoute();  // Capture params
  const db = getFirestore(app);
  const [itemList, setItemList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params && params.categoryName) {
      getItemListByCategory(params.categoryName);  
    }
  }, [params]);

  const getItemListByCategory = async (categoryName) => {
    setItemList([]);
    setLoading(true);
    const q = query(collection(db, 'UserPost'), where('category', '==', categoryName));
    const snapshot = await getDocs(q);
    setLoading(false);
    snapshot.forEach(doc => {
      setItemList(prevItems => [...prevItems, doc.data()]);
    });
  };

  return (
    <View className="flex-1 p-4 bg-gray-100">
        <ScrollView>
        {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator
            size={'large'}
            color={'#3b82f6'}
            accessible={true}
            accessibilityLabel="Loading posts"
          />
        </View>
      ) : itemList?.length > 0 ? (
        <LatestItemList
          latestItemList={itemList}
          heading={'Latest Posts'}
          accessible={true}
          accessibilityLabel="List of latest posts"
        />
      ) : (
        <Text
          className="text-lg text-gray-400 text-center mt-5"
          accessible={true}
          accessibilityLabel="No posts available"
        >
          No Product Available
        </Text>
      )}
        </ScrollView>
     
    </View>
  );
}
