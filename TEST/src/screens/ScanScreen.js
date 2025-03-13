import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ScanScreen = () => {
  const navigation = useNavigation();  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Scan Screen - Work in Progress</Text>

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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A1128", // Dark Blue Background
  },
  text: {
    color: "#89CFF0", // Light Blue Text
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

export default ScanScreen;
