import React, {useEffect, useState} from "react";
import {View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import {useRoute, useNavigation} from "@react-navigation/native"

const API_BASE = "http://192.168.1.60:5001";

const ScanResultScreen = () => {
    const { params } = useRoute();

    const navigation = useNavigation();
    const { ean } = params;

    const [data, setData] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComplent = async () => {
            try {
                const res = await axios.get(`${API_BASE}/qrcode/${ean}`);
                const name = res.data.name;

                if (!name) {
                    setNotFound(true);
                    return;
                }

                const compRes = await axios.get(`${API_BASE}/complement/${encodeURIComponent(name)}`);
                const results = compRes.data;

                if (results.length > 0) {
                    setData(results);
                    setNotFound(false);
                }
                else {
                    setNotFound(true);
                }
            }
            catch(err){
                console.error("Scan error", err);
                setNotFound(true);
            }
            finally{
                setLoading(false);
            }

            
        };

        fetchComplent();
      }, [ean]);

      return (

    <View style={styles.container}>
    <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
      <Ionicons name="close" size={32} color="#003B73" />
    </TouchableOpacity>

    {loading ? (
      <ActivityIndicator size="large" color="#003B73" />
    ) : notFound ? (
      <Text style={styles.message}>😕 Aucun complément trouvé pour ce code-barres.</Text>
    ) : (
      <ScrollView contentContainerStyle={styles.scroll}>
        {data.map((item, idx) => (
            <View key={idx} style={styles.card}>
            {Object.entries(item).map(([key, value]) => (
              value?.trim() ? (
                <Text key={key} style={styles.section}>
                  <Text style={styles.label}>{key.replace(/_/g, " ")}:</Text> {value}
                </Text>
              ) : null
            ))}
          </View>
        ))}
      </ScrollView>
    )}
  </View>
);
};

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 20 },
closeButton: { position: "absolute", top: 40, right: 20, zIndex: 10 },
message: { marginTop: 100, fontSize: 18, textAlign: "center", color: "#666" },
scroll: { paddingBottom: 60 },
card: {
  backgroundColor: "#FAFAF5",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
  elevation: 3,
},
title: { fontSize: 24, fontWeight: "bold", color: "#003B73", marginBottom: 10 },
section: { fontSize: 16, marginBottom: 6, color: "#001F54" },
label: { fontWeight: "bold", color: "#003B73" },
pathology: { marginTop: 10, fontStyle: "italic", color: "#555" },
});

export default ScanResultScreen;
