import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ScanScreen = () => {
  return (
      <View style={styles.container}>
        <Text style={styles.text}>Scan screen work in progress</Text>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A1128",
  },
  text: {
    fontSize: 20,
    color: "#89CFF0",
    fontWeight: "bold",
  },
});

export default ScanScreen;
