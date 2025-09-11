// HomeScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Muka</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Main", {screen: "Pathologie"})}>
        <Ionicons name="medkit-outline" size={40} color="#001F54" />
        <Text style={styles.buttonText}>Pathologies</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Main", {screen: "Scan"})}>
        <Ionicons name="barcode-outline" size={40} color="#001F54" />
        <Text style={styles.buttonText}>Scan</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Main", {screen: "Recherche"})}>
        <Ionicons name="search-outline" size={40} color="#001F54" />
        <Text style={styles.buttonText}>Recherche</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAF5",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#003B73",
    marginBottom: 40,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0ECF8",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginVertical: 10,
    width: "80%",
    flexDirection: "row",
    gap: 16,
  },
  buttonText: {
    fontSize: 18,
    color: "#001F54",
    fontWeight: "600",
  },
});

export default HomeScreen;