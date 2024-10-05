import { View, Text, TouchableOpacity, Image, Dimensions, Alert, StyleSheet, Platform } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import * as Speech from 'expo-speech';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the microphone icon
import { app } from '../../../firebaseConfig';
import { useUser } from '@clerk/clerk-expo'; // Clerk for user authentication

export default function PostItem({ item, productList }) {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const db = getFirestore(app);
  const { user } = useUser(); // Clerk user state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Start the voice command
  const startVoiceCommand = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Sorry!', 'Voice commands are only supported on web platforms currently.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Alert.alert("Browser doesn't support speech recognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setTranscript(spokenText);
      processVoiceCommand(spokenText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const processVoiceCommand = (command) => {
    const lowerCaseCommand = command.toLowerCase();

    if (lowerCaseCommand.includes('add')) {
      addProductByVoice();
    }  else {
      Speech.speak('Command not recognized.');
    }
  };

  // Add product to user list
  const addProductByVoice = async () => {
    if (!user) {
      Speech.speak('Please log in to add products to your list.');
      return;
    }

    try {
      const docRef = doc(collection(db, 'UserLists'), `${user.id}_${item.id}`);
      await setDoc(docRef, {
        userId: user.id,
        title: item.title,
        price: item.price,
        desc: item.desc,
        createdAt: new Date(),
      });
      Speech.speak(`${item.title} has been successfully added to your list.`);
    } catch (error) {
      console.error('Error adding to list: ', error);
      Speech.speak('There was an error adding the product to your list. Please try again.');
    }
  };

  // Search for a product by title
  const searchProductByTitle = (title) => {
    const matchedProduct = productList.find(item =>
      item.title.toLowerCase().includes(title.toLowerCase())
    );

    if (matchedProduct) {
      Speech.speak(`Found product: ${matchedProduct.title}.`);
      Speech.speak(`Description: ${matchedProduct.desc}. Price: ${matchedProduct.price}. Category: ${matchedProduct.category}.`);
    } else {
      Speech.speak(`No product found for ${title}.`);
    }
  };

  // Announce all available products
  const announceAvailableProducts = () => {
    console.log("Product List:", productList);
    if (productList && productList.length > 0) {
      Speech.speak(`There are ${productList.length} available products.`);
      productList.forEach(item => {
        Speech.speak(`Name: ${item.title}. Description: ${item.desc}. Price: ${item.price}. Category: ${item.category}.`);
      });
    } else {
      Speech.speak('No available products at the moment.');
    }
  };

  // Announce available products in the current category
  const announceAvailableProductsInCategory = (category) => {
    console.log("Category: ", category);

    if (!productList || productList.length === 0) {
      Speech.speak('No products available at the moment.');
      return;
    }

    const productsInCategory = productList.filter(product => 
      product.category.toLowerCase() === category.toLowerCase() 
    );

    if (productsInCategory.length > 0) {
      Speech.speak(`There are ${productsInCategory.length} available products in the ${category} category.`);
      productsInCategory.forEach(item => {
        Speech.speak(`Name: ${item.title}. Description: ${item.desc}. Price: ${item.price}.`);
      });
    } else {
      Speech.speak(`No available products in the ${category} category.`);
    }
  };

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
        resizeMode="cover"
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

      {/* Microphone Button */}
      <TouchableOpacity style={styles.micButton} onPress={startVoiceCommand}>
        <Ionicons name="mic" size={30} color="white" />
      </TouchableOpacity>

      {isListening && <Text style={styles.listeningText}>Listening...</Text>}
      <Text style={styles.transcriptText}>Transcript: {transcript}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  micButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'blue',
    borderRadius: 30,
    padding: 10,
  },
  listeningText: {
    marginTop: 5,
    fontSize: 16,
    color: 'green',
  },
  transcriptText: {
    marginTop: 5,
    fontSize: 16,
  },
});
