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
    <View className="bg-white p-3 mb-4 border-b-4 border-orange-600 shadow-lg rounded-lg flex-row items-center justify-between">
      {/* Product Image */}
      <Image
        source={{ uri: item.image }}
        className="h-[100px] w-[100px] rounded-lg"
        accessible={true}
        accessibilityLabel={`Image of ${item.title}`}
      />
      
      {/* Product Details */}
      <View className="flex-1 ml-4">
        <Text className="font-bold text-[18px]" accessible={true} accessibilityLabel={`Title ${item.title}`}>
          {item.title}
        </Text>
        <Text className="text-gray-500 mt-2" accessible={true} accessibilityLabel={`Description ${item.desc}`}>
          {item.desc}
        </Text>
        <View className="flex-row items-center mt-3">
          <Text className="text-orange-500" accessible={true} accessibilityLabel={`Category ${item.category}`}>
            {item.category}
          </Text>
          <Text className="text-gray-700 ml-2" accessible={true} accessibilityLabel={`Price Rs.${item.price}`}>
            - Rs.{item.price}
          </Text>
        </View>
      </View>
      
      {/* Remove Button */}
      <TouchableOpacity
        className="bg-red-500 p-2 rounded-lg"
        onPress={() => handleRemove(item.id, item.price)}
        accessible={true}
        accessibilityLabel={`Remove ${item.title} from list`}
      >
        <Text className="text-white font-bold">Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Item List */}
      <FlatList
        data={myList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
      />
      
      {/* Total Amount */}
      {myList.length > 0 && (
        <View className="bg-white p-4 border-t border-orange-500" accessible={true} accessibilityLabel={`Total price Rs.${totalAmount.toFixed(2)}`}>
          <Text className="font-bold text-[18px] text-right">
            Total: Rs.{totalAmount.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
}
