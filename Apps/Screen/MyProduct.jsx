import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import { useUser } from '@clerk/clerk-expo';
import LatestItemList from '../Components/HomeScreen/LatestItemList';
import { useNavigation } from '@react-navigation/native';

export default function MyProduct() {
    const db = getFirestore(app);
    const { user } = useUser();
    const [productList, setProductList] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        if (user) {
            getUserPost();
        }
    }, [user]); // Ensure this only runs when `user` changes

    useEffect(()=>{
        navigation.addListener('focus',(e)=>{
            console.log(e);
            getUserPost();
        });
    },[navigation])

    const getUserPost = async () => {
        setProductList([]); // Clear the product list before fetching new data

        try {
            const q = query(collection(db, 'UserPost'), where('userEmail', '==', user?.primaryEmailAddress?.emailAddress));
            const snapshot = await getDocs(q);

            snapshot.forEach(doc => {
                console.log(doc.data());
                setProductList(prevList => [...prevList, doc.data()]);
            });
        } catch (error) {
            console.error("Error fetching user posts:", error);
        }
    };

    return (
        <View>
            <LatestItemList latestItemList={productList} />
        </View>
    );
}
