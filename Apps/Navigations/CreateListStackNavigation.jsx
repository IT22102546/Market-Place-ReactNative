import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import ProfileScreen from '../Screen/ProfileScreen';
import MyProduct from '../Screen/MyProduct';
import ProductDetail from '../Screen/ProductDetail';
import ItemList from '../Screen/ItemList';
import CreateList from '../Screen/CreateList';

export default function CreateListStackNavigation() {
    const Stack = createStackNavigator();
    return (
      <Stack.Navigator>
          <Stack.Screen name="create-List" component={CreateList}
            options={{
                headerShown:false
            }}
        />
            <Stack.Screen name='product-detail' component={ProductDetail}
            options={{
                headerStyle:{
                    backgroundColor:'#3b82f6'
                },
                headerTintColor:'#fff',
                headerTitle:'Detail' 
            }}
            
        />
          
      </Stack.Navigator>
    )
}