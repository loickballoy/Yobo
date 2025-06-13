// RechercheScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import axios from "axios";

const API_BASE = "http://192.168.1.60:5001";

const RechercheScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/complement/${encodeURIComponent(searchQuery.trim())}`);
      setResult(res.data);
    } catch (err) {
      console.error("Erreur recherche complément:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (text) => {
    if (!text) return "#003B73";
    const t = text.toLowerCase();
    if (t.includes("éviter") || t.includes("danger") || t.includes("toxique")) return "#B00020"; // red
    if (t.includes("prudence") || t.includes("surveiller") || t.includes("interagir")) return "#E65100"; // orange
    return "#003B73"; // default
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher un complément"
        placeholderTextColor="#89CFF0"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#003B73" />
      ) : (
        <ScrollView style={styles.resultsContainer}>
          {result && result.map((item, idx) => (
            <View key={idx} style={styles.resultCard}>
              <Text style={styles.title}>{item.Complement_Alimentaire}</Text>

              {item.Interactions_Pro && (
                <Text style={[styles.section, { color: getRiskColor(item.Interactions_Pro) }]}>💊 Pro : {item.Interactions_Pro}</Text>
              )}
              {item.Interactions_Patient && (
                <Text style={[styles.section, { color: getRiskColor(item.Interactions_Patient) }]}>🧑‍⚕️ Patient : {item.Interactions_Patient}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FAFAF5", marginTop: 40,},
  searchBar: {
    height: 40,
    borderColor: "#003B73",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: "#003B73",
    marginBottom: 10,
  },
  resultsContainer: { marginTop: 10 },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#C8D8E4",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  title: { fontSize: 20, color: "#003B73", fontWeight: "bold", marginBottom: 12 },
  section: { fontSize: 16, marginBottom: 10 },
});

export default RechercheScreen;
