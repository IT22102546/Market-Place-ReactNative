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
        <Ionicons name="share-social" size={24} color="white" className="mr-4" onPress={shareProduct} />
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
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      {
        text: 'Yes',
        onPress: deleteFromFireStore,
      },
      {
        text: 'Cancel',
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
      {/* Product Image */}
      <Image 
        source={{ uri: product.image }} 
        className="h-[320px] w-full object-cover"
        accessible={true} 
        accessibilityLabel={`Image of ${product.title}`} 
      />
      
      {/* Product Information */}
      <View className="p-4">
        <Text className="text-[24px] font-bold" accessible={true} accessibilityLabel={`Product title ${product.title}`}>
          {product?.title}
        </Text>
        <Text className="p-1 px-2 mt-2 rounded-full bg-blue-200 text-blue-500 text-[14px]" accessible={true} accessibilityLabel={`Category ${product.category}`}>
          {product.category}
        </Text>
        
        <Text className="mt-4 text-[20px] font-bold">Description</Text>
        <Text className="text-[16px] mt-2" accessible={true} accessibilityLabel={`Description ${product.desc}`}>
          {product?.desc}
        </Text>
      </View>

      {/* User Info */}
      <View className="p-4 flex-row gap-3 items-center bg-blue-100 border-t border-gray-200">
        <Image 
          source={{ uri: product.userImage }} 
          className="w-12 h-12 rounded-full"
          accessible={true} 
          accessibilityLabel={`User profile image of ${product.userName}`} 
        />
        <View>
          <Text className="font-bold text-[18px]" accessible={true} accessibilityLabel={`User name ${product.userName}`}>
            {product.userName}
          </Text>
          <Text className="text-gray-500" accessible={true} accessibilityLabel={`User email ${product.userEmail}`}>
            {product.userEmail}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="p-4">
        {user?.primaryEmailAddress?.emailAddress === product.userEmail ? (
          <TouchableOpacity 
            onPress={deleteUserPost} 
            className="bg-red-500 rounded-full p-4 my-2"
            accessible={true}
            accessibilityLabel="Delete your post"
          >
            <Text className="text-center text-white">Delete Post</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity 
              onPress={sendEmailMessage} 
              className="bg-blue-500 rounded-full p-4 my-2"
              accessible={true}
              accessibilityLabel="Send message to seller"
            >
              <Text className="text-center text-white">Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={addToList} 
              className="bg-green-500 rounded-full p-4 my-2"
              accessible={true}
              accessibilityLabel="Add product to your list"
            >
              <Text className="text-center text-white">Add To List</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}
