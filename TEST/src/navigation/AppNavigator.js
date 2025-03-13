import React from "react";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import ScanScreen from "../screens/ScanScreen";
import PathologyScreen from "../screens/PathologyScreen";
import RechercheScreen from "../screens/RechercheScreen";
import PathologyScreenDetails from "../screens/PathologyScreenDetails";
import MicronutrientDetailsScreen from "../screens/MicronutrientDetailsScreen";

const Stack = createStackNavigator();

// Smooth Fade Transition
const screenOptions = {
  gestureEnabled: false,
  cardStyle: { backgroundColor: "transparent" }, // Removes white flash effect
  cardStyleInterpolator: ({ current }) => ({
    cardStyle: {
      opacity: current.progress, // Fade-in transition
    },
  }),
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ScanScreen" component={ScanScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PathologyScreen" component={PathologyScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RechercheScreen" component={RechercheScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PathologyScreenDetails" component={PathologyScreenDetails} options={({route}) => ({title: route.params.pathology})}/>
        <Stack.Screen name="MicronutrientDetailsScreen" component={MicronutrientDetailsScreen} options={({route}) => ({title: route.params.pathology})}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
