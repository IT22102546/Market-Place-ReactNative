import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import ExploreScreen from '../Screen/ExploreScreen'
import ProductDetail from '../Screen/ProductDetail'

export default function ExploreStackNavigation() {

    const Stack = createStackNavigator();
  return (
    <Stack.Navigator>
        <Stack.Screen name="explore-tab" component={ExploreScreen}
            options={{
                headerShown:false
            }}
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