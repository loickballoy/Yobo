import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import axios from "axios";

const API_BASE = "http://192.168.1.60:5000";

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
                <ActivityIndicator size="large" color="#89CFF0" />
            ) : (
                <ScrollView style={styles.resultsContainer}>
                    {result && result.map((item, idx) => (
                        <View key={idx} style={styles.resultCard}>
                            <Text style={styles.title}>{item.Complement_Alimentaire}</Text>
                            {item.Interactions_Pro && (
                                <Text style={styles.section}><Text style={styles.label}>Interactions Pro :</Text> {item.Interactions_Pro}</Text>
                            )}
                            {item.Interactions_Patient && (
                                <Text style={styles.section}><Text style={styles.label}>Interactions Patient :</Text> {item.Interactions_Patient}</Text>
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#0A1128" },
    searchBar: {
        height: 40,
        borderColor: "#89CFF0",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        color: "#fff",
        marginBottom: 10,
    },
    resultsContainer: { marginTop: 10 },
    resultCard: {
        backgroundColor: "#001F54",
        borderColor: "#89CFF0",
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    title: { fontSize: 18, color: "#fff", fontWeight: "bold", marginBottom: 8 },
    section: { fontSize: 15, color: "#fff", marginBottom: 8 },
    label: { color: "#89CFF0", fontWeight: "bold" },
});

export default RechercheScreen;
