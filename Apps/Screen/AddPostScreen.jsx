import { 
  View, Text, TextInput, TouchableOpacity, Image, 
  ScrollView, ToastAndroid, ActivityIndicator, Alert, 
  KeyboardAvoidingView, Platform 
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { app } from '../../firebaseConfig';
import { addDoc, collection, getDocs, getFirestore } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { Formik } from 'formik';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import Header from '../Components/HomeScreen/Header';

export default function AddPostScreen() {
  const [image, setImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const db = getFirestore(app);
  const [categoryList, setCategoryList] = useState([]);
  const storage = getStorage();
  const { user } = useUser();

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
          ToastAndroid.show("Failed to upload image", ToastAndroid.SHORT);
          setIsUploading(false);
        }, 
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          value.image = downloadUrl;
          value.userName = user?.fullName || '';
          value.userEmail = user?.primaryEmailAddress?.emailAddress || '';
          value.userImage = user?.imageUrl || '';
          await addDoc(collection(db, "UserPost"), value);
          Alert.alert("Success", "Post added successfully!", [{ text: "OK" }]);
          resetForm();
          setImage(null);
          setIsUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      ToastAndroid.show("Failed to add post", ToastAndroid.SHORT);
      setIsUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : null} 
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        keyboardShouldPersistTaps="handled"
      >
        <Header />
        <View style={{ padding: 20 }}>
          <Text style={styles.title}>Add New Post</Text>
          <Text style={styles.subtitle}>Add new product and start selling!</Text>

          <Formik
            initialValues={{ title: '', desc: '', category: '', address: '', price: '' }}
            onSubmit={(value, actions) => onSubmitMethod(value, actions)}
            validate={(values) => {
              const errors = {};
              if (!values.title) {
                ToastAndroid.show("Please Enter Title", ToastAndroid.SHORT);
                errors.name = "Please Enter Title";
              }
              return errors;
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors }) => (
              <View>
                {/* Image Picker */}
                <TouchableOpacity 
                  onPress={pickImage} 
                  style={styles.imagePicker} 
                  disabled={isUploading}
                  accessible={true} 
                  accessibilityLabel="Pick an image for your post"
                >
                  {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                  ) : (
                    <Image source={require('./../../assets/images/placeHolder.jpg')} style={styles.image} />
                  )}
                </TouchableOpacity>

                {/* Form Inputs */}
                <TextInput
                  style={styles.input}
                  placeholder='Title'
                  onChangeText={handleChange('title')}
                  onBlur={handleBlur('title')}
                  value={values.title}
                  editable={!isUploading}
                />
                <TextInput
                  style={styles.input}
                  placeholder='Description'
                  onChangeText={handleChange('desc')}
                  onBlur={handleBlur('desc')}
                  value={values.desc}
                  numberOfLines={5}
                  editable={!isUploading}
                />
                <TextInput
                  style={styles.input}
                  placeholder='Address'
                  onChangeText={handleChange('address')}
                  onBlur={handleBlur('address')}
                  value={values.address}
                  editable={!isUploading}
                />
                <TextInput
                  style={styles.input}
                  placeholder='Price'
                  onChangeText={handleChange('price')}
                  onBlur={handleBlur('price')}
                  keyboardType='number-pad'
                  value={values.price}
                  editable={!isUploading}
                />

                {/* Category Picker */}
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={values.category}
                    style={styles.input}
                    onValueChange={(itemValue) => setFieldValue('category', itemValue)}
                    enabled={!isUploading}
                  >
                    {categoryList.map((item, index) => (
                      <Picker.Item key={index} label={item.name} value={item.name} />
                    ))}
                  </Picker>
                </View>

                {/* Submit Button */}
                <TouchableOpacity 
                  onPress={handleSubmit} 
                  style={styles.submitButton} 
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit</Text>
                  )}
                </TouchableOpacity>

                {/* Upload Progress */}
                {isUploading && (
                  <View style={styles.progressContainer}>
                    <Text>Uploading: {Math.round(uploadProgress)}%</Text>
                  </View>
                )}
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = {
  title: {
    fontWeight: 'bold',
    fontSize: 27,
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: 'gray',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
    fontSize: 16,
  },
  imagePicker: {
    alignItems: 'center',
    marginVertical: 15,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
    borderColor: "#FF6500"
  },
  submitButton: {
    padding: 16,
    backgroundColor: '#FF6500',
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
  progressContainer: {
    marginTop: 10,
  },
};
