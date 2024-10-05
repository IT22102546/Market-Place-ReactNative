import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../Screen/HomeScreen';
import ItemList from '../Screen/ItemList';
import ProductDetail from '../Screen/ProductDetail';
import Categories from '../Components/HomeScreen/Categories';
import LatestItemList from '../Components/HomeScreen/LatestItemList';
import VoiceItemList from '../Screen/VoiceItemLits';
import { ScrollView } from 'react-native-gesture-handler';

const Stack = createStackNavigator();

export default function HomeScreenStackNav() {
  return (
    
      <Stack.Navigator>
        <Stack.Screen name='home' component={HomeScreen}
            options={{
                headerShown:false
            }}
        />
        <Stack.Screen name='item-list' component={ItemList}
            options={({ route }) => ({ title: route.params.category , headerStyle:{
                backgroundColor:'#FF6500'
            }, headerTintColor:'#fff' })}
        />

        <Stack.Screen name='item' component={VoiceItemList}
            options={({ route }) => ({ 
            title: route.params.categoryName, 
            headerStyle: { backgroundColor: '#FF6500' },
            headerTintColor: '#fff'
            })}
        />

      

        <Stack.Screen name='product-detail' component={ProductDetail}
            options={{
                headerStyle:{
                    backgroundColor:'#FF6500'
                },
                headerTintColor:'#fff',
                headerTitle:'Detail' 
            }}
            
        />
      </Stack.Navigator>
  
  )
}