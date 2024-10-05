import React, { useState } from 'react';
import { View, Text, Button, Platform, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { useNavigation } from '@react-navigation/native';

export default function VoiceCommandApp() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const navigation = useNavigation();

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
      handleVoiceCommand(spokenText);
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

   // Function to handle specific voice commands and navigate
   const handleVoiceCommand = (command) => {
    const lowerCaseCommand = command.toLowerCase();

    // Navigate to Home screen if the user says "go to home"
    if (lowerCaseCommand.includes('go to home')) {
      navigation.navigate('home-nav');  // Example: Home Tab
    }
    // Navigate to Profile screen if the user says "go to profile"
    else if (lowerCaseCommand.includes('go to profile')) {
      navigation.navigate('profile');  // Example: Profile Tab
    }
    else if (lowerCaseCommand.includes('go to explore')) {
        navigation.navigate('explore-tab');  // Example: Profile Tab
    }
    else if (lowerCaseCommand.includes('go to add post')) {
        navigation.navigate('addpost');  // Example: Profile Tab
    }
    else if (lowerCaseCommand.includes('go to create list')) {
        navigation.navigate('list');  // Example: Profile Tab
    }
    // Add other commands as needed
    else {
      Alert.alert("Command not recognized", `You said: "${command}"`);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.customButton} onPress={startVoiceCommand}>
        <Text style={styles.buttonText}>Start Voice Command</Text>
      </TouchableOpacity>
      {isListening && <Text>Listening...</Text>}
      <Text>Transcript: {transcript}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      padding: 10,
      
      justifyContent: 'center',
      alignItems: 'bottom',
    },
    customButton: {
      backgroundColor: '#FF6500',  // Use the color you want
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 20,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });