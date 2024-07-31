import { View, Text } from 'react-native';
import Header from '../Components/HomeScreen/Header';
import Slider from '../Components/HomeScreen/Slider';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import { useEffect, useState } from 'react';
import tw from 'twrnc';

export default function HomeScreen() {
  const db = getFirestore(app);
  const [sliderList, setSliderList] = useState([]);

  useEffect(() => {
    getSliders();
  }, []);

  const getSliders = async () => {
    setSliderList([]);

    const querySnapshot = await getDocs(collection(db, "sliders"));
    querySnapshot.forEach((doc) => {
      console.log(doc.id, "=>", doc.data());
      setSliderList((prevSliderList) => [...prevSliderList, doc.data()]);
    });
  };

  return (
    <View style={tw`p-7 bg-white flex-1`}>
      <Header />
      <Slider sliderList={sliderList} />
    </View>
  );
}
