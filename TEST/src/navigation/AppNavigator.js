// AppNavigator.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import PathologyScreen from "../screens/PathologyScreen";
import ScanScreen from "../screens/ScanScreen";
import RechercheScreen from "../screens/RechercheScreen";
import MicronutrientDetailsScreen from "../screens/MicronutrientDetailsScreen";
import ScanResultScreen from "../screens/ScanResultScreen";

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Pathology") iconName = "medkit-outline";
          else if (route.name === "Scan") iconName = "barcode-outline";
          else if (route.name === "Search") iconName = "search-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#003B73",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: { backgroundColor: "#FAFAF5" },
      })}
    >
      <Tab.Screen name="Pathology" component={PathologyScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Search" component={RechercheScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Home">
        <RootStack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="MicronutrientDetailsScreen"
          component={MicronutrientDetailsScreen}
          options={{ title: "Complément" }}
        />
        <RootStack.Screen
          name="ScanResultScreen"
          component={ScanResultScreen}
          options={{ presentation: 'modal', headerShown: false }}
          />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
