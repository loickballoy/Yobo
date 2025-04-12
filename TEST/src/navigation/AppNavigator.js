import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import PathologyScreen from "../screens/PathologyScreen";
import RechercheScreen from "../screens/RechercheScreen";
import ScanScreen from "../screens/ScanScreen";
import MicronutrientDetailsScreen from "../screens/MicronutrientDetailsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
      <Tab.Navigator
          initialRouteName="Scan"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === "Pathology") iconName = "list-outline";
              else if (route.name === "Scan") iconName = "scan-outline";
              else if (route.name === "Recherche") iconName = "search-outline";
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "#89CFF0",
            tabBarInactiveTintColor: "gray",
            headerShown: false,
            tabBarStyle: { backgroundColor: "#001F54" },
          })}
      >
        <Tab.Screen name="Pathology" component={PathologyScreen} />
        <Tab.Screen name="Scan" component={ScanScreen} />
        <Tab.Screen name="Recherche" component={RechercheScreen} />
      </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{headerShown: false}}/>
          <Stack.Screen name="MicronutrientDetailsScreen" component={MicronutrientDetailsScreen}
                        options={{title: "Détail du complément"}}/>
        </Stack.Navigator>
      </NavigationContainer>
  );
}