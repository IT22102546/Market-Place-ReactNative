import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image, ScrollView, ToastAndroid, ActivityIndicator, Alert, KeyboardAvoidingView } from 'react-native';
import React, { useState, useCallback } from 'react';
import { app } from '../../firebaseConfig';
import { addDoc, collection, getDocs, getFirestore } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { Formik } from 'formik';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';

export default function AddPostScreen() {
  const [image, setImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const db = getFirestore(app);
  const [categoryList, setCategoryList] = useState([]);
  const storage = getStorage();
  const { user } = useUser(); // Destructure user from useUser
  
  useFocusEffect(
    useCallback(() => {
      getCategoryList();
    }, [])
  );

  const getCategoryList = async () => {
    setCategoryList([]);
    const querySnapshot = await getDocs(collection(db, "Category"));
    const categories = [];
    querySnapshot.forEach((doc) => {
      console.log("Docs:", doc.data());
      categories.push(doc.data());
    });
    setCategoryList(categories);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const onSubmitMethod = async (value, { resetForm }) => {
    try {
      setIsUploading(true);
      const resp = await fetch(image);
      const blob = await resp.blob();
      const storageRef = ref(storage, 'communityPost/' + Date.now() + ".jpg");

      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (error) => {
          console.error("Upload Error: ", error);
          ToastAndroid.show("Failed to upload image", ToastAndroid.SHORT);
          setIsUploading(false);
        }, 
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          value.image = downloadUrl;

          // Add user details to the value object
          value.userName = user?.fullName || ''; // Fetch full name or set to an empty string if null
          value.userEmail = user?.primaryEmailAddress?.emailAddress || ''; // Fetch email address
          value.userImage = user?.imageUrl || ''; // Fetch user profile image

          const docRef = await addDoc(collection(db, "UserPost"), value);
          if (docRef.id) {
            console.log("Document Added");
            
            // Show success alert
            Alert.alert(
              "Success",
              "Post added successfully!",
              [{ text: "OK" }]
            );

            resetForm();  // Clear form fields
            setImage(null);  // Clear the image state
          }
          setIsUploading(false);
          setUploadProgress(0);  // Reset progress
        }
      );
    } catch (error) {
      console.error("Error adding document: ", error);
      ToastAndroid.show("Failed to add post", ToastAndroid.SHORT);
      setIsUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView>
        <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add new Post</Text>
      <Text style={styles.subtitle}>Add new Product and start Selling</Text>
      <Formik
        initialValues={{ title: '', desc: '', category: '', address: '', price: '', image: '', userName:'',userEmail:'',userImage:'' , createdAt:Date.now().toString()}}
        onSubmit={(value, actions) => onSubmitMethod(value, actions)}
        validate={(values) => {
          const errors = {};
          if (!values.title) {
            console.log("Please enter Title");
            ToastAndroid.show("Please Enter Title", ToastAndroid.SHORT);
            errors.name = "Please Enter Title";
          }
          return errors;
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors }) => (
          <View>
            <TouchableOpacity onPress={pickImage} disabled={isUploading}>
              {image ?
                <Image source={{ uri: image }} style={styles.image} />
                : <Image source={require('./../../assets/images/placeHolder.jpg')}
                  style={styles.image}
                />}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder='Title'
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
              value={values?.title}
              editable={!isUploading}
            />
            <TextInput
              style={styles.input}
              placeholder='Description'
              onChangeText={handleChange('desc')}
              onBlur={handleBlur('desc')}
              numberOfLines={5}
              value={values?.desc}
              editable={!isUploading}
            />

            <TextInput
              style={styles.input}
              placeholder='Address'
              onChangeText={handleChange('address')}
              onBlur={handleBlur('address')}
              value={values?.address}
              editable={!isUploading}
            />
            <TextInput
              style={styles.input}
              placeholder='Price'
              onChangeText={handleChange('price')}
              onBlur={handleBlur('price')}
              keyboardType='number-pad'
              value={values?.price}
              editable={!isUploading}
            />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={values?.category}
                style={styles.input}
                onValueChange={(itemValue) => setFieldValue('category', itemValue)}
                enabled={!isUploading}
              >
                {categoryList && categoryList.map((item, index) => (
                  <Picker.Item key={index} label={item.name} value={item.name} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={isUploading}>
              {isUploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>

            {isUploading && (
              <View style={styles.progressContainer}>
                <Text>Uploading: {Math.round(uploadProgress)}%</Text>
              </View>
            )}
          </View>
        )}
      </Formik>
    </ScrollView>
    </KeyboardAvoidingView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 27,
  },
  subtitle: {
    fontWeight: 'bold',
    fontSize: 13,
    color: 'gray',
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 19,
    marginTop: 10,
    marginBottom: 5,
    fontSize: 15,
    marginVertical: 5,
    textAlignVertical: 'top'
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
  },
  submitButton: {
    padding: 16,
    backgroundColor: 'blue',
    marginTop: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
  progressContainer: {
    marginTop: 10,
  },
});
