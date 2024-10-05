import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';  // For the mic icon
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';  // For text-to-speech feedback
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';  // Firestore import
import { useUser } from '@clerk/clerk-expo';  // For user authentication

export default function CreateList() {
  const [shoppingList, setShoppingList] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const navigation = useNavigation();
  const db = getFirestore();  // Firestore database reference
  const { user } = useUser();  // Fetch current user details

  // Function to start voice command using Web Speech API
  const startVoiceCommand = () => {
    if (Platform.OS !== 'web') {
      Alert.alert("Sorry!", "Voice commands are only supported in web platforms currently.");
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
      processVoiceCommand(spokenText);  // Process the recognized speech
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

  // Function to process voice commands related to shopping list
  const processVoiceCommand = (command) => {
    const lowerCaseCommand = command.toLowerCase();

    // Handle "add" command (e.g., "add sugar 1kg")
    if (lowerCaseCommand.startsWith('add')) {
      const itemDetails = lowerCaseCommand.replace('add', '').trim();
      if (itemDetails) {
        addItemToList(itemDetails);
      } else {
        Alert.alert('No item specified', 'Please say the item and quantity, e.g., "add sugar 1kg".');
      }
    }
    // Handle "remove" command (e.g., "remove milk")
    else if (lowerCaseCommand.startsWith('remove')) {
      const itemToRemove = lowerCaseCommand.replace('remove', '').trim();
      if (itemToRemove) {
        removeItemFromList(itemToRemove);
      } else {
        Alert.alert('No item specified', 'Please say the item to remove, e.g., "remove milk".');
      }
    }
    // Handle "save my list" command
    else if (lowerCaseCommand.includes('save my list')) {
      saveListToFirebase();  // Save the list to Firebase
    }
    // Handle "open my shopping list" command
    else if (lowerCaseCommand.includes('open my shopping list')) {
      fetchShoppingListFromFirebase();  // Fetch the list from Firebase
    }
    // Other commands can be added similarly
    else {
      Alert.alert("Command not recognized", `You said: "${command}"`);
    }
  };

  // Add item to the shopping list
  const addItemToList = (item) => {
    const newItem = { id: Date.now().toString(), name: item };
    setShoppingList((prevList) => [...prevList, newItem]);

    // Use Text-to-Speech (TTS) to confirm item added
    Speech.speak(`${item} added to your list`);
  };

  // Remove item from the shopping list
  const removeItemFromList = (itemName) => {
    const updatedList = shoppingList.filter((item) => !item.name.toLowerCase().includes(itemName.toLowerCase()));
    if (updatedList.length === shoppingList.length) {
      Alert.alert('Item not found', `No matching item for: "${itemName}"`);
    } else {
      setShoppingList(updatedList);
      Speech.speak(`${itemName} removed from your list`);  // Use TTS for item removal
      Alert.alert('Success', `"${itemName}" has been removed from your shopping list.`);
    }
  };

  // Fetch the user's shopping list from Firebase
const fetchShoppingListFromFirebase = async () => {
  try {
    const q = query(collection(db, 'UserLists'), where('userId', '==', user.id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      Alert.alert('No list found', 'You have not saved any shopping list.');
      Speech.speak('You have no saved shopping list.');
      return;
    }

    const fetchedList = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Check if 'list' field exists in the document and is an array
      if (data.list && Array.isArray(data.list)) {
        // Loop through the items in the 'list' array
        data.list.forEach((item) => {
          if (item.name) {
            fetchedList.push(item);  // Add item to fetchedList if it has a 'name' field
          }
        });
      } else {
        console.error("Error: 'list' field is missing or not an array");
        Alert.alert('Error', 'List is missing or improperly structured in Firebase.');
        return;
      }
    });

    setShoppingList(fetchedList);
    Speech.speak('Your shopping list has been opened.');
  } catch (error) {
    console.error("Error fetching list from Firebase:", error);
    Alert.alert('Error', 'Failed to fetch the list. Please try again.');
  }
};

  // Save the list to Firebase Firestore
  const saveListToFirebase = async () => {
    if (shoppingList.length === 0) {
      Alert.alert('Your list is empty', 'Please add items to your list before saving.');
      return;
    }

    try {
      await addDoc(collection(db, 'UserLists'), {
        userId: user.id,
        list: shoppingList,
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Your shopping list has been saved!');
      Speech.speak('Your shopping list has been saved');  // Voice feedback on successful save
      setShoppingList([]);  // Clear the list after saving
    } catch (error) {
      console.error("Error saving list to Firebase:", error);
      Alert.alert('Error', 'Failed to save the list. Please try again.');
    }
  };

  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Shopping List</Text>

      {/* Display Shopping List */}
      <FlatList
        data={shoppingList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemText}>{item.name}</Text>
            <TouchableOpacity onPress={() => removeItemFromList(item.name)}>
              <Ionicons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Start Voice Command Button */}
      <TouchableOpacity style={styles.micButton} onPress={startVoiceCommand}>
        <Ionicons name="mic" size={30} color="white" />
      </TouchableOpacity>

      {/* Listening Status */}
      {isListening && <Text style={styles.listeningText}>Listening...</Text>}
      <Text style={styles.transcriptText}>Transcript: {transcript}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  itemText: {
    fontSize: 18,
  },
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
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  transcriptText: {
    marginTop: 10,
    fontSize: 16,
    color: 'gray',
  },
});
