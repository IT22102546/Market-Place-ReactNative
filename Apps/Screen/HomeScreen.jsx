import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert, StyleSheet, Platform } from 'react-native';
import Header from '../Components/HomeScreen/Header';
import Slider from '../Components/HomeScreen/Slider';
import { collection, getDocs, getFirestore, orderBy } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import tw from 'twrnc';
import Categories from '../Components/HomeScreen/Categories';
import LatestItemList from '../Components/HomeScreen/LatestItemList';
import * as Speech from 'expo-speech'; // Import Expo Speech for text-to-speech
import { Ionicons } from '@expo/vector-icons'; // Import icons for microphone button
import { useNavigation } from '@react-navigation/native'; // For navigation

export default function HomeScreen() {
  const db = getFirestore(app);
  const [sliderList, setSliderList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [latestItemList, setLatestItemList] = useState([]);
  const navigation = useNavigation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    getSliders();
    getCategoryList();
    getLatestItemList();
  }, []);

  const getSliders = async () => {
    const querySnapshot = await getDocs(collection(db, 'sliders'));
    const sliders = querySnapshot.docs.map(doc => doc.data());
    setSliderList(sliders);
  };

  const getCategoryList = async () => {
    const querySnapshot = await getDocs(collection(db, 'Category'));
    const categories = querySnapshot.docs.map(doc => doc.data());
    setCategoryList(categories);
  };

 

  // Function to start voice command for navigation
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
      console.log("Spoken text:", spokenText);
      processVoiceCommand(spokenText, categoryList);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log("Voice recognition ended");
    };

    recognition.start();
  };

  // Function to process voice commands related to category navigation
  const processVoiceCommand = (command, categoryList) => {
    const lowerCaseCommand = command.toLowerCase();
  
    // Handle "go to category name" command
    if (lowerCaseCommand.startsWith('go to')) {
      const categoryName = lowerCaseCommand.replace('go to', '').trim();
      const categoryExists = categoryList.find(category => category.name.toLowerCase() === categoryName);
  
      if (categoryExists) {
        // Navigate to the ItemList screen and pass categoryName
        navigation.navigate('item', { categoryName: categoryExists.name });
        Speech.speak(`Navigating to ${categoryExists.name}`);
      } else {
        Alert.alert('Category not found', `No category found with the name "${categoryName}".`);
        Speech.speak(`No category found with the name ${categoryName}`);
      }
    } else {
      Alert.alert("Command not recognized", `You said: "${command}"`);
      Speech.speak(`Command not recognized: ${command}`);
    }
  };
  

  const getLatestItemList = async () => {
    setLatestItemList([]);
    const querySnapshot = await getDocs(collection(db, 'UserPost'), orderBy('createdAt', 'desc'));
    querySnapshot.forEach((doc) => {
      console.log('Docs', doc.data());
      setLatestItemList((latestItemList) => [...latestItemList, doc.data()]);
    });
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <ScrollView
        style={tw`p-6`}
        accessible={true}
        accessibilityLabel="Home Screen, scrollable content"
      >
        <Header />
        {/* Slider Section */}
        <Slider sliderList={sliderList} accessible={true} accessibilityLabel="Image slider of featured items" />

        {/* Categories Section */}
        <Categories categoryList={categoryList} accessible={true} accessibilityLabel="Categories of items" />

        {/* Latest Items Section */}
        <LatestItemList
        latestItemList={latestItemList}
        heading="Latest Items"
        accessible={true}
        accessibilityLabel="List of latest added items"
      />
      </ScrollView>

      {/* Floating microphone button for voice command */}
      <TouchableOpacity style={styles.micButton} onPress={startVoiceCommand}>
        <Ionicons name="mic" size={30} color="white" />
      </TouchableOpacity>

      {isListening && <Text style={styles.listeningText}>Listening...</Text>}
      <Text style={styles.transcriptText}>Transcript: {transcript}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  micButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#FF6500',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningText: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    color: 'green',
    fontSize: 16,
  },
  transcriptText: {
    position: 'absolute',
    bottom: 70,
    right: 30,
    color: 'blue',
    fontSize: 16,
  },
});
