import React, { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, TransitionSpecs, CardStyleInterpolators } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

const PathologyScreenDetails = ({ route, navigation }) => {
  const { pathology } = route.params;
  const [micronutrients, setMicronutrients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://192.168.1.90:5000/Pathology/${pathology}`)
      .then(response => {
        setMicronutrients(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching details:", error);
        setLoading(false);
      });
  }, [pathology]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{pathology}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#89CFF0" />
      ) : (
        <FlatList
          data={micronutrients}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Text style={styles.item}>{item[0]}</Text>}
        />
      )}

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavContainer}>
            <View style={styles.bottomNavLine} />
            <View style={styles.bottomNavBackground} />
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
  container: { flex: 1, padding: 20, backgroundColor: "#0A1128" },
  title: { fontSize: 24, color: "#89CFF0", marginBottom: 10, textAlign: "center" },
  item: { fontSize: 18, color: "#fff", paddingVertical: 5 },

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
  bottomNavBackground: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 60, // Adjust as needed
    backgroundColor: "rgba(10, 17, 40, 0.9)", // Dark Blue with Opacity
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 10,
  },
});

export default PathologyScreenDetails;