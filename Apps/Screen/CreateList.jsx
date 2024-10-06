import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For the mic icon
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech'; // For text-to-speech feedback
import { getFirestore, collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'; // Firestore import
import { useUser } from '@clerk/clerk-expo'; // For user authentication

export default function CreateList() {
  const [shoppingList, setShoppingList] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [shops, setShops] = useState([]); // State to store shops
  const [selectedShop, setSelectedShop] = useState(null); // Holds the selected shop details
  const [crowdCount, setCrowdCount] = useState(null); // Holds the crowd count for the selected shop
  const navigation = useNavigation();
  const db = getFirestore(); // Firestore database reference
  const { user } = useUser(); // Fetch current user details

  // Function to start voice command using Web Speech API
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
      processVoiceCommand(spokenText); // Process the recognized speech
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
    // Handle "open my shopping list" command
    else if (lowerCaseCommand.includes('open my shopping list')) {
      fetchShoppingListFromFirebase(); // Fetch the list from Firebase
    }
    // Handle "delete list" command
    else if (lowerCaseCommand.includes('delete list')) {
      deleteAllItemsFromFirestore(); // Call confirmation before deletion
    } 
    // Handle "tell my list" command
    else if (lowerCaseCommand.includes('tell my list')) {
      readShoppingList(); // Call the function to read the shopping list
    }
    // Handle "give summary" command
    else if (lowerCaseCommand.includes('give summary')) {
      giveShoppingListSummary();
    }
    // Handle "find shop near me" command
    else if (lowerCaseCommand.includes('find shop near me')) {
      findNearbyShops(); // Fetch nearby shops
    }
    // Handle "select {shop name}" command
    else if (lowerCaseCommand.startsWith('select')) {
      const shopName = lowerCaseCommand.replace('select', '').trim();
      selectShopByName(shopName); // Handle selecting a shop by its name
    }
    // Handle "tell total amount" command
    else if (lowerCaseCommand.includes('tell total amount')) {
      tellTotalAmount(); // Calculate and speak the total amount
    }
    else {
      Alert.alert("Command not recognized", `You said: "${command}"`);
    }
  };

  // Add item to the shopping list and Firestore
  const addItemToList = async (item) => {
    const newItem = { id: Date.now().toString(), name: item };
    setShoppingList((prevList) => [...prevList, newItem]);

    // Save item to Firestore
    try {
      const docRef = await addDoc(collection(db, 'UserLists'), {
        userId: user.id,
        name: item,
        createdAt: new Date().toISOString(),
      });
      newItem.firestoreId = docRef.id; // Store the Firestore document ID
    } catch (error) {
      console.error('Error adding item to Firestore:', error);
      Alert.alert('Error', 'Failed to add item to Firestore.');
    }

    // Use Text-to-Speech (TTS) to confirm item added
    Speech.speak(`${item} added to your list`);
  };

  // Function to calculate and announce the total amount of items
  const tellTotalAmount = () => {
    const totalAmount = shoppingList.reduce((total, item) => {
      return total + (item.price || 0); // Assuming each item has a price property
    }, 0);
    
    Speech.speak(`The total amount of your shopping list is ${totalAmount} rupees.`);
  };

  // Remove item from the shopping list and Firestore
  const removeItemFromList = async (itemName) => {
    const updatedList = shoppingList.filter((item) => {
      return !item.name.toLowerCase().includes(itemName.toLowerCase());
    });
  
    if (updatedList.length === shoppingList.length) {
      Alert.alert('Item not found', `No matching item for: "${itemName}"`);
    } else {
      // Find the item that was removed to get its Firestore ID
      const removedItem = shoppingList.find((item) => item.name.toLowerCase().includes(itemName.toLowerCase()));
  
      // Remove from Firestore
      if (removedItem && removedItem.firestoreId) {
        try {
          const itemRef = doc(db, 'UserLists', removedItem.firestoreId); // Use Firestore ID for deletion
          await deleteDoc(itemRef); // Delete the item from Firestore
          console.log('Item removed from Firestore:', removedItem.name);
        } catch (error) {
          console.error('Error removing item from Firestore:', error);
          Alert.alert('Error', 'Failed to remove item from Firestore.');
        }
      }
  
      setShoppingList(updatedList);
      Speech.speak(`${itemName} removed from your list`); // Use TTS for item removal
      Alert.alert('Success', `"${itemName}" has been removed from your shopping list.`);
    }
  };
  
  const deleteAllItemsFromFirestore = async () => {
    try {
      const q = query(collection(db, 'UserLists'), where('userId', '==', user.id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('No list found', 'There are no items to delete.');
        return;
      }

      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref)); // Prepare delete promises

      await Promise.all(deletePromises); // Execute all deletions
      setShoppingList([]); // Clear the local shopping list
      Alert.alert('Success', 'All items have been deleted from your shopping list.');
      Speech.speak('All items have been deleted from your shopping list.'); // TTS feedback
    } catch (error) {
      console.error('Error deleting items from Firestore:', error);
      Alert.alert('Error', 'Failed to delete items from Firestore.');
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
        if (data.name) {
          fetchedList.push({
            name: data.name,        
            price: data.price,      
            firestoreId: doc.id     
          });
        }
      });
  
      setShoppingList(fetchedList);
      Speech.speak('Your shopping list has been opened.');
    } catch (error) {
      console.error("Error fetching list from Firebase:", error);
      Alert.alert('Error', 'Failed to fetch the list. Please try again.');
    }
  };

  const giveShoppingListSummary = () => {
    if (shoppingList.length === 0) {
      Speech.speak('Your shopping list is empty.');
      return;
    }
  
    // Map over shoppingList to include both name and price in the summary
    const itemsSummary = shoppingList.map(item => `${item.name} priced at ${item.price || 0} rupees`).join(', ');
  
    // Calculate the total amount
    const totalAmount = shoppingList.reduce((total, item) => {
      return total + (item.price || 0);
    }, 0);
  
    // Use Text-to-Speech (TTS) to give the summary
    Speech.speak(`Your shopping list contains: ${itemsSummary}. The total amount is ${totalAmount} rupees.`);
  };

  const readShoppingList = () => {
    if (shoppingList.length === 0) {
      Speech.speak('Your shopping list is empty.');
      return;
    }
  
    // Map over shoppingList to include both name and price
    const items = shoppingList.map(item => `${item.name} priced at ${item.price} rupees`).join(', ');
    Speech.speak(`Your shopping list contains: ${items}`);
  };

  const findNearbyShops = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users')); // Fetching from the "users" collection
      
      if (querySnapshot.empty) {
        Alert.alert('No shops found');
        Speech.speak('No shops found nearby.');
        return;
      }

      const shopList = [];
      querySnapshot.forEach((doc) => {
        const shopData = doc.data();
        
        // Ensure the document has shop details
        if (shopData.shopID && shopData.shopname) {
          shopList.push({
            shopID: shopData.shopID,
            shopname: shopData.shopname,
            brnumber: shopData.brnumber,  // Assuming brnumber is stored in the shop document
          });
        }
      });

      setShops(shopList);  // Save the shop list to state
      console.log(shopList);
      if (shopList.length > 0) {
        Speech.speak('Nearby shops found. You can select a shop from the list.');
        shopList.forEach((shop) => {
          Speech.speak(`Shop: ${shop.shopname}`);
        });
      } else {
        Speech.speak('No shops found nearby.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch shops.');
      Speech.speak('Failed to fetch nearby shops.');
    }
  };

  const selectShopByName = async (shopName) => {
    const normalizedShopName = shopName
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .trim()
      .toLowerCase();

    const selectedShop = shops.find(
      (shop) => shop.shopname.trim().toLowerCase() === normalizedShopName
    );

    if (selectedShop) {
      try {
        const q = query(
          collection(db, "crowdcount"),
          where("brnumber", "==", selectedShop.brnumber)
        );
        const querySnapshot = await getDocs(q);
        let crowdCount = 0;

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            crowdCount = data.crowdCount; // Assuming 'crowdCount' is the field in the document
          });

          // Update state with selected shop and its crowd count
          setSelectedShop(selectedShop); // Set the selected shop
          setCrowdCount(crowdCount); // Set the crowd count

          Speech.speak(
            `The current crowd count at ${selectedShop.shopname} is ${crowdCount}.`
          );
        } else {
          Alert.alert(
            "Crowd data not found",
            "No crowd count data found for the selected shop."
          );
          Speech.speak("Crowd data not found for this shop.");
        }
      } catch (error) {
        console.error("Error fetching crowd count:", error);
        Alert.alert(
          "Error",
          "Failed to fetch the crowd count. Please try again."
        );
        Speech.speak("Failed to fetch the crowd count.");
      }
    } else {
      Alert.alert("Shop not found", `The shop "${shopName}" was not found.`);
      Speech.speak(`The shop ${shopName} was not found.`);
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

      {/* Display Found Shops */}
      <Text style={styles.title}>Nearby Shops</Text>
      <FlatList
        data={shops}
        keyExtractor={(item) => item.shopID}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemText}>{item.shopname}</Text>
            <TouchableOpacity
              onPress={() => Alert.alert(`Selected shop: ${item.shopname}`)}
            >
              <Ionicons name="md-storefront" size={24} color="blue" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Display Selected Shop and Crowd Count */}
      {selectedShop && (
        <View style={styles.crowdCountContainer}>
          <Text style={styles.title}>Crowd Count in Selected Store</Text>
          <Text style={styles.selectedShopText}>
            {selectedShop.shopname} - Current Crowd: {crowdCount}
          </Text>
        </View>
      )}

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
  crowdCountContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedShopText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  transcriptText: {
    marginTop: 10,
    fontSize: 16,
    color: 'gray',
  },
});
