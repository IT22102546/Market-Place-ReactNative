import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { collection, query, where, getDocs, getFirestore, deleteDoc, doc } from 'firebase/firestore';
import { app } from '../../firebaseConfig';

export default function MyList() {
  const { user } = useUser();
  const [myList, setMyList] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const db = getFirestore(app);

  useEffect(() => {
    fetchMyList();
  }, []);

  const fetchMyList = async () => {
    const q = query(collection(db, 'UserLists'), where('userId', '==', user?.id));
    const querySnapshot = await getDocs(q);
    const list = [];
    let total = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      list.push({ ...data, id: doc.id });
      total += parseFloat(data.price);  // Calculate the total amount
    });
    setMyList(list);
    setTotalAmount(total);  // Update the total amount
  };

  const handleRemove = async (itemId, price) => {
    try {
      await deleteDoc(doc(db, 'UserLists', itemId));
      setMyList(myList.filter((item) => item.id !== itemId));
      setTotalAmount(totalAmount - parseFloat(price));  // Update the total amount after removal
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  };

  const renderItem = ({ item }) => (
    <View className="bg-white p-3 border-b border-gray-200 rounded-lg shadow-sm flex-row items-center justify-between">
      <Image source={{ uri: item.image }} className="h-[100px] w-[100px] rounded-lg" />
      <View className="flex-1 ml-4">
        <Text className="font-bold text-[18px]">{item.title}</Text>
        <Text className="text-gray-500 mt-2">{item.desc}</Text>
        <View className="flex-row items-center mt-3">
          <Text className="text-blue-500">{item.category}</Text>
          <Text className="text-gray-700 ml-2">- Rs.{item.price}</Text>
        </View>
      </View>
      <TouchableOpacity 
        className="bg-red-500 p-2 rounded-lg"
        onPress={() => handleRemove(item.id, item.price)}
      >
        <Text className="text-white font-bold">Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1">
      <FlatList
        data={myList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
      />
      {myList.length > 0 && (
        <View className="bg-white p-4 border-t border-gray-200">
          <Text className="font-bold text-[18px] text-right">Total: Rs.{totalAmount.toFixed(2)}</Text>
        </View>
      )}
    </View>
  );
}
