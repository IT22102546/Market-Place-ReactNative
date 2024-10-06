import { View, Text } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ExploreScreen from "../Screen/ExploreScreen";
import AddPostScreen from "../Screen/AddPostScreen";
import ProfileScreen from "../Screen/ProfileScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import HomeScreenStackNav from "./HomeScreenStackNav";
import ExploreStackNavigation from "./ExploreStackNavigation";
import ProfileScreenStackNav from "./ProfileScreenStackNav";
import CreateListStackNavigation from "./CreateListStackNavigation";

const Tab = createBottomTabNavigator();

export default function TabNavigation() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#FF6500", // Active icon color (blue)
        tabBarInactiveTintColor: "#888888", // Inactive icon color (gray)
        tabBarStyle: {
          backgroundColor: "#ffffff", // Tab bar background color (white)
          borderTopColor: "#cccccc", // Border color at the top of the tab bar
          paddingBottom: 5, // Padding at the bottom to space out icons
          height: 60, // Increase height for larger touch areas
        },
        tabBarLabelStyle: {
          fontSize: 12, // Font size for the labels
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "home-nav") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "explore-tab") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "addpost") {
            iconName = focused ? "camera" : "camera-outline";
          } else if (route.name === "profile") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          } else if (route.name === "list") {
            iconName = focused ? "list" : "list-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="home-nav"
        component={HomeScreenStackNav}
        options={{
          tabBarLabel: "Home",
        }}
      />

      <Tab.Screen
        name="explore-tab"
        component={ExploreStackNavigation}
        options={{
          tabBarLabel: "Explore",
        }}
      />

      <Tab.Screen
        name="list"
        component={CreateListStackNavigation}
        options={{
          tabBarLabel: "Create List",
        }}
      />

      <Tab.Screen
        name="profile"
        component={ProfileScreenStackNav}
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}
