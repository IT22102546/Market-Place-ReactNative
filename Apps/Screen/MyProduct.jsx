import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import { useUser } from '@clerk/clerk-expo';
import LatestItemList from '../Components/HomeScreen/LatestItemList';
import { useNavigation } from '@react-navigation/native';

export default function MyProduct() {
  const db = getFirestore(app);
  const { user } = useUser();
  const [productList, setProductList] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      getUserPost();
    }
  }, [user]); // Fetch products only when the user changes

  useEffect(() => {
    navigation.addListener('focus', (e) => {
      console.log(e);
      getUserPost();
    });
  }, [navigation]);

  const getUserPost = async () => {
    setProductList([]); // Clear the product list before fetching new data

    try {
      const q = query(
        collection(db, 'UserPost'),
        where('userEmail', '==', user?.primaryEmailAddress?.emailAddress)
      );
      const snapshot = await getDocs(q);

      snapshot.forEach((doc) => {
        console.log(doc.data());
        setProductList((prevList) => [...prevList, doc.data()]);
      });
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      {/* Header Section */}
      <Text className="text-2xl font-bold mb-4" accessible={true} accessibilityLabel="My Products">
        My Products
      </Text>

      {/* List of Products */}
      {productList.length > 0 ? (
        <LatestItemList
          latestItemList={productList}
          heading={'Your Products'}
          accessible={true}
          accessibilityLabel="List of your products"
        />
      ) : (
        <Text className="text-center text-gray-500 mt-10" accessible={true} accessibilityLabel="No products available">
          No products available.
        </Text>
      )}
    </View>
  );
}
