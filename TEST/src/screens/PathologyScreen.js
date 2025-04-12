// PathologyScreen.js
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Animated } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const API_BASE = "http://192.168.1.60:5000"; // adapte cette IP à ton environnement

const PathologyScreen = () => {
    const [pathologies, setPathologies] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [complements, setComplements] = useState({});
    const [loading, setLoading] = useState(true);
    const animationValues = useRef({}).current;
    const navigation = useNavigation();

    useEffect(() => {
        axios.get(`${API_BASE}/pathologies`)
            .then(res => {
                setPathologies(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des pathologies:", err);
                setLoading(false);
            });
    }, []);

    const togglePathology = async (pathology) => {
        const isExpanding = !expanded[pathology];
        setExpanded(prev => ({ ...prev, [pathology]: isExpanding }));

        if (!complements[pathology]) {
            try {
                const res = await axios.get(`${API_BASE}/complements/${encodeURIComponent(pathology)}`);
                setComplements(prev => ({ ...prev, [pathology]: res.data }));
            } catch (err) {
                console.error("Erreur lors du chargement des compléments:", err);
            }
        }

        if (!animationValues[pathology]) {
            animationValues[pathology] = new Animated.Value(0);
        }
        Animated.timing(animationValues[pathology], {
            toValue: isExpanding ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const goToMicronutrientDetails = (name) => {
        navigation.navigate("MicronutrientDetailsScreen", { name });
    };

    const renderComplementList = (pathology) => {
        const height = animationValues[pathology]?.interpolate({
            inputRange: [0, 1],
            outputRange: [0, (complements[pathology]?.length || 0) * 44],
        }) || new Animated.Value(0);

        return (
            <Animated.View style={{ height, overflow: "hidden" }}>
                {complements[pathology]?.map((item, idx) => (
                    <TouchableOpacity key={idx} style={styles.complementItem} onPress={() => goToMicronutrientDetails(item)}>
                        <Text style={styles.complementText}>{item}</Text>
                    </TouchableOpacity>
                ))}
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#89CFF0" />
            ) : (
                <FlatList
                    data={pathologies}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <View>
                            <TouchableOpacity onPress={() => togglePathology(item)} style={styles.pathologyItem}>
                                <Text style={styles.pathologyText}>{item}</Text>
                                <Ionicons name={expanded[item] ? "chevron-up" : "chevron-down"} size={20} color="#fff" />
                            </TouchableOpacity>
                            {renderComplementList(item)}
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#0A1128" },
    pathologyItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#89CFF0"
    },
    pathologyText: { fontSize: 18, color: "#fff" },
    complementItem: { paddingLeft: 20, paddingVertical: 12, backgroundColor: "#001F54" },
    complementText: { fontSize: 16, color: "#89CFF0" }
});

export default PathologyScreen;
