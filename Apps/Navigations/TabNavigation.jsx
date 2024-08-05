import { View, Text } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ExploreScreen from '../Screen/ExploreScreen';
import AddPostScreen from '../Screen/AddPostScreen';
import ProfileScreen from '../Screen/ProfileScreen';
import Ionicons from '@expo/vector-icons/Ionicons';
import HomeScreenStackNav from './HomeScreenStackNav';
import HomeScreen from '../Screen/HomeScreen';


const Tab = createBottomTabNavigator();

export default function TabNavigation() {
  return (
    <Tab.Navigator screenOptions={{
        headerShown:false,
        
    }}>
        <Tab.Screen name='home-nav' component={HomeScreenStackNav} 
        options={{tabBarLabel:({color})=>(
            <Text style={{color:color,fontSize:12,marginBottom:3}}>Home</Text>
        ),
        tabBarIcon:({color,size})=>(
            <Ionicons name="home" size={size} color={color} />
        )
        }}></Tab.Screen>


        <Tab.Screen name='explore' component={ExploreScreen} 
        options={{tabBarLabel:({color})=>(
            <Text style={{color:color,fontSize:12,marginBottom:3}}>Explore</Text>
        )
        ,
        tabBarIcon:({color,size})=>(
            <Ionicons name="search" size={size} color={color} />
        )}}></Tab.Screen>

        <Tab.Screen name='addpost' component={AddPostScreen}
        options={{tabBarLabel:({color})=>(
            <Text style={{color:color,fontSize:12,marginBottom:3}}>Add Post</Text>
        )
        ,
        tabBarIcon:({color,size})=>(
            <Ionicons name="camera" size={size} color={color} />
        )}}></Tab.Screen>

        <Tab.Screen name='profile' component={ProfileScreen}
        options={{tabBarLabel:({color})=>(
            <Text style={{color:color,fontSize:12,marginBottom:3}}>Profile</Text>
        )
        ,
        tabBarIcon:({color,size})=>(
            <Ionicons name="person-circle"size={size} color={color} />
        )}}></Tab.Screen>
    </Tab.Navigator>
  )
}