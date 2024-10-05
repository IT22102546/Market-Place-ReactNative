import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech'; // For text-to-speech feedback
import { collection, getDocs, getFirestore, orderBy, query, doc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Firebase Authentication
import { app } from '../../firebaseConfig';
import { ScrollView } from 'react-native-gesture-handler';
import Header from '../Components/HomeScreen/Header';
import LatestItemList from '../Components/HomeScreen/LatestItemList';
import { useUser } from '@clerk/clerk-expo';

export default function Explore() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [productList, setProductList] = useState([]);
  const { user } = useUser();


  const db = getFirestore(app);
  const auth = getAuth(app); // Initialize auth

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is logged in, set the user ID and display name
        setUserId(user.uid);
        setUserName(user.displayName || 'Anonymous'); // Default to 'Anonymous' if no display name
      } else {
        setUserId(null);
        setUserName(null);
      }
    });

    // Cleanup subscription on component unmount
    return unsubscribe;
  }, []);

  useEffect(() => {
    getAllProducts();
  }, []);

  const getAllProducts = async () => {
    const q = query(collection(db, 'UserPost'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const products = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() }); // Include the document ID
    });
    setProductList(products);
  };

  const startVoiceCommand = () => {
    if (Platform.OS !== 'web') {
      Alert.alert("Sorry!", "Voice commands are only supported on web platforms currently.");
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
      console.log("Voice recognition started");
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setTranscript(spokenText);
      processVoiceCommand(spokenText);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const processVoiceCommand = (command) => {
    const lowerCaseCommand = command.toLowerCase();

    if (lowerCaseCommand.includes('available products')) {
      announceAvailableProducts();
    } 
    else if (lowerCaseCommand.startsWith('search')) {
      const searchTerm = lowerCaseCommand.replace('search', '').trim();
      if (searchTerm) {
        searchProductByTitle(searchTerm);
      } else {
        Speech.speak('Please specify a product name to search for.');
      }
    } 
    // New command to add a product
    else if (lowerCaseCommand.startsWith('add')) {
      const productName = lowerCaseCommand.replace('add', '').trim();
      if (productName) {
        addProductByVoice(productName);
      } else {
        Speech.speak('Please specify a product name to add.');
      }
    } else {
      Speech.speak("Command not recognized.");
    }
  };

  // Add product to UserList by voice command
  const addProductByVoice = (productName) => {
    const matchedProduct = productList.find(item => 
      item.title.toLowerCase().includes(productName.toLowerCase())
    );

    if (matchedProduct) {
      addToUserList(matchedProduct); // Add to UserList if matched
    } else {
      Speech.speak(`No product found for ${productName}.`);
    }
  };

  // Add product to UserLists collection in Firebase
  const addToUserList = async (product) => {
    if (!user) {
      Speech.speak('Please log in to add products to your list.');
      return;
    }
  
    try {
      // Create a document reference using userId and product id
      const docRef = doc(collection(db, 'UserLists'), `${user.id}_${product.id}`);
  
      // Set the document with user and product details
      await setDoc(docRef, {
        userId: user.id,
        userName: product.userName, // Make sure you have this property in user
        title: product.title,
        price: product.price,
        desc: product.desc,
        size: product.size,
        createdAt: new Date(),
      });
  
      Speech.speak(`${product.title} has been successfully added to your list.`);
    } catch (error) {
      console.error('Error adding to list: ', error);
      Speech.speak('There was an error adding the product to your list. Please try again.');
    }
  };

  const searchProductByTitle = (title) => {
    const matchedProduct = productList.find(item => 
      item.title.toLowerCase().includes(title.toLowerCase())
    );

    if (matchedProduct) {
      Speech.speak(`Found product: ${matchedProduct.title}.`);
      Speech.speak(`Description: ${matchedProduct.desc}. Price: ${matchedProduct.price}. Size: ${matchedProduct.size}. Store Name: ${matchedProduct.userName}. Cell Number: ${matchedProduct.cell}.`);
    } else {
      Speech.speak(`No product found for ${title}.`);
    }
  };

  const announceAvailableProducts = () => {
    if (productList.length > 0) {
      Speech.speak(`There are ${productList.length} available products.`);
      productList.forEach(item => {
        Speech.speak(`Name: ${item.title}. Description: ${item.desc}. Price: ${item.price}. Size: ${item.size}. Store Name: ${item.userName}.Product available at :${item.cell} `);
      });
    } else {
      Speech.speak(`No available products at the moment.`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Items</Text>

      <ScrollView className="p-6 bg-white">
        <Text className="text-[20px] font-bold mt-5">Explore More</Text>
        <LatestItemList latestItemList={productList} />
      </ScrollView>

      <TouchableOpacity style={styles.micButton} onPress={startVoiceCommand}>
        <Ionicons name="mic" size={30} color="white" />
      </TouchableOpacity>

      {isListening && <Text style={styles.listeningText}>Listening...</Text>}
      <Text style={styles.transcriptText}>Transcript: {transcript}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  micButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: 'blue',
    borderRadius: 30,
    padding: 10,
  },
  listeningText: {
    marginTop: 20,
    fontSize: 16,
    color: 'green',
  },
  transcriptText: {
    marginTop: 10,
    fontSize: 16,
  },
});
