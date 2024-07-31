import { View, Text } from 'react-native';
import Header from '../Components/HomeScreen/Header';
import Slider from '../Components/HomeScreen/Slider';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import { useEffect, useState } from 'react';
import tw from 'twrnc';
import Categories from '../Components/HomeScreen/Categories';

export default function HomeScreen() {
  const db = getFirestore(app);
  const [sliderList, setSliderList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    getSliders();
    getCategoryList();
  }, []);

  const getSliders = async () => {
    setSliderList([]);

    const querySnapshot = await getDocs(collection(db, "sliders"));
    querySnapshot.forEach((doc) => {
      console.log(doc.id, "=>", doc.data());
      setSliderList((prevSliderList) => [...prevSliderList, doc.data()]);
    });
  };

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

  return (
    <View style={tw`p-7 bg-white flex-1`}>
      <Header />
      <Slider sliderList={sliderList} />
      <Categories categoryList={categoryList}/>
    </View>
  );
}
