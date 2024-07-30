import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { app } from '../../firebaseConfig';
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { Formik } from 'formik';
import { Picker } from '@react-native-picker/picker';

export default function AddPostScreen() {
  const db = getFirestore(app);
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    getCategoryList();
  }, []);

  const getCategoryList = async () => {
    setCategoryList([]);
    const querySnapshot = await getDocs(collection(db,"Category"));
    const categories = [];
    querySnapshot.forEach((doc) => {
      console.log("Docs:", doc.data());
      categories.push(doc.data());
    });
    setCategoryList(categories);
  };

  return (
    <View className="p-10">
      <Text className="font-bold text-[27px]">Add new Post</Text>
      <Text className="font-bold text-[13px] text-gray-500 mb-8">Add new Product and start Selling</Text>
      <Formik
        initialValues={{ title: '', desc: '', category: '', address: '', price: '', image: '' }}
        onSubmit={values => console.log(values)}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values }) => (
          <View>
            <TextInput
              style={styles.input}
              placeholder='Title'
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
              value={values?.title}
            />
            <TextInput
              style={styles.input}
              placeholder='Description'
              onChangeText={handleChange('desc')}
              onBlur={handleBlur('desc')}
              numberOfLines={5}
              value={values?.desc}
            />
            
            <TextInput
              style={styles.input}
              placeholder='Address'
              onChangeText={handleChange('address')}
              onBlur={handleBlur('address')}
              value={values?.address}
            />
            <TextInput
              style={styles.input}
              placeholder='Price'
              onChangeText={handleChange('price')}
              onBlur={handleBlur('price')}
              keyboardType='number-pad'
              value={values?.price}
            />
            <View style={{borderWidth:1, borderRadius:10, marginTop:10}}>
              <Picker 
                selectedValue={values?.category}
                style={styles.input}
                onValueChange={(itemValue) => setFieldValue('category', itemValue)}
              >
                {categoryList && categoryList.map((item, index) => (
                  <Picker.Item key={index} label={item.name} value={item.name} />
                ))}
              </Picker>
            </View>
            
            <TouchableOpacity  onPress={handleSubmit} className="p-4 bg-blue-500 mt-8 rounded-full">
                <Text className="text-white text-center text-[16px]">Submit</Text>
            </TouchableOpacity>
           
          </View>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 19,
    marginTop: 10,
    marginBottom: 5,
    fontSize: 15,
    marginVertical: 5,
    textAlignVertical:'top'
  }
});
