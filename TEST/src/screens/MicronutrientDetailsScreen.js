import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";

const API_BASE = "http://192.168.1.60:5000"; // adapte à ton IP locale

const MicronutrientDetailsScreen = ({ route }) => {
  const { name } = route.params;
  const [info, setInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/complement/${encodeURIComponent(name)}`)
        .then(res => {
          setInfo(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(`Erreur de chargement du complément: ${name}`, err);
          setLoading(false);
        });
  }, [name]);

  return (
      <ScrollView style={styles.container}>
        {loading ? (
            <ActivityIndicator size="large" color="#89CFF0" />
        ) : (
            info.map((entry, idx) => (
                <View key={idx} style={styles.card}>
                  <Text style={styles.title}>{entry.Complement_Alimentaire}</Text>
                  {entry.Effets_Indesirables && <Text style={styles.section}><Text style={styles.label}>Effets :</Text> {entry.Effets_Indesirables}</Text>}
                  {entry.Interactions_Pro && <Text style={styles.section}><Text style={styles.label}>Interactions Pro :</Text> {entry.Interactions_Pro}</Text>}
                  {entry.Interactions_Patient && <Text style={styles.section}><Text style={styles.label}>Interactions Patient :</Text> {entry.Interactions_Patient}</Text>}
                  {entry.Recommandations && <Text style={styles.section}><Text style={styles.label}>Recommandations :</Text> {entry.Recommandations}</Text>}
                  <Text style={styles.pathology}>📌 Pathologie : {entry.Pathologie}</Text>
                </View>
            ))
        )}
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A1128", padding: 16 },
  card: {
    backgroundColor: "#001F54",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderColor: "#89CFF0",
    borderWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  section: { fontSize: 16, color: "#fff", marginBottom: 8 },
  label: { fontWeight: "bold", color: "#89CFF0" },
  pathology: { fontSize: 14, color: "#89CFF0", marginTop: 8 }
});

export default MicronutrientDetailsScreen;