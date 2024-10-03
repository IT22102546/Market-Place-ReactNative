import { View, ScrollView, Text } from 'react-native';
import Header from '../Components/HomeScreen/Header';
import Slider from '../Components/HomeScreen/Slider';
import { collection, getDocs, getFirestore, orderBy } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import { useEffect, useState } from 'react';
import tw from 'twrnc';
import Categories from '../Components/HomeScreen/Categories';
import LatestItemList from '../Components/HomeScreen/LatestItemList';

export default function HomeScreen() {
  const db = getFirestore(app);
  const [sliderList, setSliderList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [latestItemList, setLatestItemList] = useState([]);

  useEffect(() => {
    getSliders();
    getCategoryList();
    getLatestItemList();
  }, []);

  const getSliders = async () => {
    setSliderList([]);
    const querySnapshot = await getDocs(collection(db, 'sliders'));
    querySnapshot.forEach((doc) => {
      console.log(doc.id, '=>', doc.data());
      setSliderList((prevSliderList) => [...prevSliderList, doc.data()]);
    });
  };

  const getCategoryList = async () => {
    setCategoryList([]);
    const querySnapshot = await getDocs(collection(db, 'Category'));
    const categories = [];
    querySnapshot.forEach((doc) => {
      console.log('Docs:', doc.data());
      categories.push(doc.data());
    });
    setCategoryList(categories);
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
    <ScrollView
      style={tw`p-6 bg-white flex-1`}
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
  );
}
