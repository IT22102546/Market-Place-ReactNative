import React, { useState } from 'react';
import { View, Text, Button, Platform, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';

export default function VoiceCommandApp() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

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