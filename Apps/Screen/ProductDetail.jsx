import { View, Text, Image, TouchableOpacity, Linking, Share, Alert, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUser } from '@clerk/clerk-expo';
import { collection, deleteDoc, getDocs, addDoc, query, where, getFirestore } from 'firebase/firestore';
import { app } from '../../firebaseConfig';

export default function ProductDetail({ navigation }) {
  const { params } = useRoute();
  const [product, setProduct] = useState({});
  const { user } = useUser();
  const db = getFirestore(app);
  const nav = useNavigation();

  useEffect(() => {
    if (params && params.product) {
      setProduct(params.product);
    }
  }, [params]);

  useEffect(() => {
    if (product?.title && product?.desc) {
      shareButton();
    }
  }, [product]);

  const shareButton = () => {
    navigation.setOptions({
      headerRight: () => (
        <Ionicons name="share-social" size={24} color="white" className="mr-4" onPress={() => shareProduct()} />
      ),
    });
  };

  const shareProduct = () => {
    const content = {
      message: product?.title + "\n" + product?.desc,
    };
    Share.share(content)
      .then((res) => console.log(res))
      .catch((error) => console.log(error));
  };

  const sendEmailMessage = () => {
    const subject = 'Regarding ' + product.title;
    const body = 'Hi ' + product.userName + '\n' + 'I am interested in this product';
    Linking.openURL('mailto:' + product.userEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body));
  };

  const deleteUserPost = () => {
    Alert.alert('Do You want to Delete?', 'Are you sure want to Delete this Post?', [
      {
        text: 'Yes',
        onPress: () => deleteFromFireStore(),
      },
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
    ]);
  };

  const deleteFromFireStore = async () => {
    const q = query(collection(db, 'UserPost'), where('title', '==', product.title));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      deleteDoc(doc.ref).then(() => nav.goBack());
    });
  };

  const addToList = async () => {
    try {
      const listItem = {
        ...product,
        userId: user?.id,
      };
      await addDoc(collection(db, 'UserLists'), listItem);
      Alert.alert('Success', 'Product added to your list!');
    } catch (error) {
      console.error("Error adding to list: ", error);
      Alert.alert('Error', 'Failed to add product to list.');
    }
  };

  return (
    <ScrollView className="bg-white">
      <Image source={{ uri: product.image }} className="h-[320px] w-full" />
      <View className="p-3">
        <Text className="text-[20px] font-bold">{product?.title}</Text>
        <View className="items-baseline">
          <Text className="p-1 px-2 mt-2 rounded-full bg-blue-200 text-blue-500">{product.category}</Text>
        </View>

        <Text className="mt-3 font-bold text-[20px]">Description</Text>
        <Text className="text-[14px]">{product?.desc}</Text>
      </View>

      <View className="p-3 flex flex-row gap-3 items-center bg-blue-100 border-gray-400">
        <Image source={{ uri: product.userImage }} className="w-12 h-12 rounded-full" />
        <View>
          <Text className="font-bold text-[18px]">{product.userName}</Text>
          <Text className="text-gray-500">{product.userEmail}</Text>
        </View>
      </View>

      {user?.primaryEmailAddress?.emailAddress === product.userEmail ? (
        <TouchableOpacity
          onPress={deleteUserPost}
          className="z-40 bg-red-500 rounded-full p-4 m-2"
        >
          <Text className="text-center text-white">Delete Post</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity
            onPress={sendEmailMessage}
            className="z-40 bg-blue-500 rounded-full p-4 m-2"
          >
            <Text className="text-center text-white">Send Message</Text>
          </TouchableOpacity>

          
        </>
        
      )}

        <TouchableOpacity
            onPress={addToList}
            className="z-40 bg-green-500 rounded-full p-4 m-2"
          >
            <Text className="text-center text-white">Add To List</Text>
          </TouchableOpacity>
    </ScrollView>
  );
}
