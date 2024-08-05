import { View, ScrollView } from 'react-native';
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
  const [latestItemList, setlatestItemList] = useState([]);

  useEffect(() => {
    getSliders();
    getCategoryList();
    getLatestItemList();
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

  const getLatestItemList = async () => {
    setlatestItemList([]);
    const querySnapshot = await getDocs(collection(db, "UserPost") , orderBy('createdAt','desc'));
    querySnapshot.forEach((doc) => {
      console.log("Docs", doc.data);
      setlatestItemList(latestItemList => [...latestItemList, doc.data()]);
    });
  };

  return (
    <ScrollView style={tw`p-6 bg-white flex-1`}>
      <Header />
      <Slider sliderList={sliderList} />
      <Categories categoryList={categoryList} />
      <LatestItemList latestItemList={latestItemList} heading={'Latest Items'} />
    </ScrollView>
  );
}
