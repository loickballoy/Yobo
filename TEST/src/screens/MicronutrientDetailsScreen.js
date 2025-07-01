// MicronutrientDetailsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";

const API_BASE = "https://muka-lept.onrender.com"; //"http://192.168.1.60:5001";

const MicronutrientDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { name, pathology } = route.params;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/complement/${encodeURIComponent(pathology)}/${encodeURIComponent(name)}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur chargement complément:", err);
        setLoading(false);
      });
  }, [name]);

  useEffect(() => {
    navigation.setOptions({
      title: "Détail du complément",
      headerBackTitle: "Pathologies",
      headerTintColor: "#003B73",
      headerTitleStyle: {
        fontWeight: "bold",
        color: "#003B73"
      },
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
  {loading ? (
    <ActivityIndicator size="large" color="#003B73" />
  ) : (
    data.map((item, idx) => (
      <View key={idx} style={styles.card}>
        {Object.entries(item).map(([key, value]) => (
          value?.trim() ? (
            <Text key={key} style={styles.section}>
              <Text style={styles.label}>{key.replace(/_/g, " ")}:</Text> {value}
            </Text>
          ) : null
        ))}
      </View>
    ))
  )}
  </ScrollView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF5",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderColor: "#C8D8E4",
    borderWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#003B73",
    marginBottom: 14,
  },
  section: {
    fontSize: 16,
    color: "#001F54",
    marginBottom: 10,
    lineHeight: 22,
  },
  label: {
    fontWeight: "bold",
    color: "#003B73",
  },
  pathology: {
    fontSize: 14,
    color: "#888",
    marginTop: 12,
    fontStyle: "italic",
  }
});

export default MicronutrientDetailsScreen;
