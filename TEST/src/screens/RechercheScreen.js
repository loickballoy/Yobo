
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import React, { useState, useEffect } from "react";
import axios from "axios";


const RechercheScreen = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        axios.get("http://192.168.1.90:5000/MicroNutrient")
          .then(response => {
            setData(response.data);
            setFilteredData(response.data);
            setLoading(false);
          })
          .catch(error => {
            console.error("Error fetching micronutrients:", error);
            setLoading(false);
          });
      }, []);

    const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
        setFilteredData(data);
    } else {
        setFilteredData(
        data.filter(item => item[0].toLowerCase().includes(query.toLowerCase()))
        );
    }
    };

    const handleSelectMicronutrient = (micronutrient) => {
    navigation.navigate("MicronutrientDetails", { micronutrient });
    };
    
    return (
      <View style={styles.container}>
        <TextInput
            style={styles.searchBar}
            placeholder="Rechercher un micronutriment..."
            placeholderTextColor="#89CFF0"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#89CFF0" />
          ) : (
            <FlatList
              data={filteredData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() => handleSelectMicronutrient(item[0])}>
                  <Text style={styles.itemText}>{item[0]}</Text>
                </TouchableOpacity>
              )}
            />
          )}

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNavContainer}>
            <View style={styles.bottomNavLine} />
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
    searchBar: {
        height: 40,
        borderColor: "#89CFF0",
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
        color: "#fff",
    },
    item: { padding: 15, borderBottomWidth: 1, borderColor: "#89CFF0" },
    itemText: { fontSize: 18, color: "#fff" },

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
      bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        paddingVertical: 10,
      },
  });
  
  export default RechercheScreen;