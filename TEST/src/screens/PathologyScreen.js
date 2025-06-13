// PathologyScreen.js
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Animated, ScrollView } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const API_BASE = "http://192.168.1.60:5001"; // adapte cette IP à ton environnement

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="medkit-outline" size={60} color="#003B73" style={{ marginBottom: 10 }} />
        <Text style={styles.headerText}>Pathologies</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#003B73" />
      ) : (
        <FlatList
          data={pathologies}
          keyExtractor={(item) => item}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View>
              <TouchableOpacity onPress={() => togglePathology(item)} style={styles.pathologyItem}>
                <Text style={styles.pathologyText}>{item}</Text>
                <Ionicons name={expanded[item] ? "chevron-up" : "chevron-down"} size={20} color="#003B73" />
              </TouchableOpacity>
              {renderComplementList(item)}
            </View>
          )}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF5" },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#003B73",
  },
  pathologyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#C8D8E4",
    backgroundColor: "#FFFFFF"
  },
  pathologyText: { fontSize: 18, color: "#003B73", fontWeight: "600" },
  complementItem: { paddingLeft: 30, paddingVertical: 12, backgroundColor: "#EAF2F8" },
  complementText: { fontSize: 16, color: "#001F54" }
});

export default PathologyScreen;