// RechercheScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const API_BASE = "https://muka-lept.onrender.com"; // "http://192.168.1.60:5001";

const RechercheScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/scanned`)
      .then(res => {
        setProducts(res.data);
        //setFilteredProducts(res.data);
      })
      .catch(err => {
        console.error("Erreur chargement des produits scannés:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setFilteredProducts([]);
    } else {
      const results = products.filter(p =>
        p.name.toLowerCase().includes(query)
      );

      const uniqueResults = Array.from(
        new Map(results.map(p => [p.barcode, p])).values()
      );

      setFilteredProducts(uniqueResults);
    }
  }, [searchQuery, products]);

  const handlePress = (barcode) => {
    navigation.navigate("ScanResultScreen", { ean: barcode });
  };

  const handleClear = () => {
    setSearchQuery("");
  };


  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchBar}
          placeholder="Rechercher un produit"
          placeholderTextColor="#89CFF0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={22} color="#003B73" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#003B73" />
      ) : searchQuery.length === 0 ? (
        <View style={styles.messageContainer}>
          <Text style={styles.message}>🔍 Commencez à chercher vos produits !</Text>
        </View>
      ) : (
        <ScrollView style={styles.resultList}>
          {filteredProducts.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resultItem}
              onPress={() => handlePress(item.barcode)}
            >
              <Text style={styles.resultText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
          {filteredProducts.length === 0 && (
            <Text style={styles.empty}>Aucun résultat trouvé</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: "#FAFAF5",},
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    //position: "relative",
  },
  searchBar: {
    height: 40,
    borderColor: "#003B73",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#003B73",
    marginBottom: 20,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: 13,
  },
  resultList: { marginTop: 10 },
  resultItem: {
    backgroundColor: "#E0F7FA",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#003B73",
  },
    barcodeText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  empty: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  message: {
    fontSize: 18,
    color: "#003B73",
    fontWeight: "500",
  },
});

export default RechercheScreen;
