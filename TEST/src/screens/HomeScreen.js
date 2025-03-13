import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, TransitionSpecs, CardStyleInterpolators } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = ({ navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Your Product</Text>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate("ScanScreen")}
      >
        <Text style={styles.scanText}>Start Scanning</Text>
      </TouchableOpacity>
      
      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavLine} />
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => navigation.navigate("PathologyScreen")}>
            <Ionicons name="list-outline" size={28} color="#89CFF0" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate("ScanScreen")}>
            <Ionicons name="scan-outline" size={32} color="#89CFF0" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate("RechercheScreen")}>
            <Ionicons name="search-outline" size={28} color="#89CFF0" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1128", // Dark Blue Background
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#89CFF0", // Light Blue Text
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: "#89CFF0", // Light Blue Button
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 50,
  },
  scanText: {
    color: "#0A1128", // Dark Blue Text for Contrast
    fontSize: 18,
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
  },
  bottomNavLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#89CFF0", // Light Blue Line Separator
    marginBottom: 5,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 10,
  },
});

export default HomeScreen;
