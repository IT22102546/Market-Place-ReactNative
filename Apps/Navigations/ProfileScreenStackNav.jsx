import { View, Text } from 'react-native';
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../Screen/ProfileScreen';
import MyProduct from '../Screen/MyProduct';
import ProductDetail from '../Screen/ProductDetail';
import MyList from '../Screen/MyList';  // Import MyList component

export default function ProfileScreenStackNav() {
    const Stack = createStackNavigator();
  
    return (
      <Stack.Navigator>
          <Stack.Screen 
            name="profile-tab" 
            options={{
                headerShown: false
            }}
            component={ProfileScreen}
          />
          <Stack.Screen 
            name="my-product" 
            component={MyProduct}
            options={{
                headerStyle: { backgroundColor: '#3b82f6' },
                headerTintColor: '#fff',
                headerTitle: 'My Products'
            }}
          />
          <Stack.Screen 
            name="product-detail" 
            component={ProductDetail}
            options={{
                headerStyle: { backgroundColor: '#3b82f6' },
                headerTintColor: '#fff',
                headerTitle: 'Detail'
            }}
          />
          <Stack.Screen 
            name="my-list" 
            component={MyList} 
            options={{
                headerStyle: { backgroundColor: '#3b82f6' },
                headerTintColor: '#fff',
                headerTitle: 'My List'
            }}
          />
      </Stack.Navigator>
    );
}
