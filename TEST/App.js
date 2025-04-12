import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ScanScreen from "./src/screens/ScanScreen";
import RechercheScreen from "./src/screens/RechercheScreen";
import PathologyScreen from "./src/screens/PathologyScreen";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";

const Stack = createStackNavigator();

export default function App() {
  return (
      <>
        <StatusBar style ="light"/>
        <AppNavigator/>
      </>
  )
}
