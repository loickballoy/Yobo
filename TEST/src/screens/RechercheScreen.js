// RechercheScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
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
        setFilteredProducts(res.data);
      })
      .catch(err => {
        console.error("Erreur chargement des produits scannés:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setFilteredProducts(products);
    } else {
      const results = products.filter(p =>
        p.name.toLowerCase().includes(query)
      );
      setFilteredProducts(results);
    }
  }, [searchQuery, products]);

  const handlePress = (barcode) => {
    navigation.navigate("ScanResult", { ean: barcode });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher un produit"
        placeholderTextColor="#89CFF0"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#003B73" />
      ) : (
        <ScrollView style={styles.resultList}>
          {filteredProducts.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resultItem}
              onPress={() => handlePress(item.barcode)}
            >
              <Text style={styles.resultText}>{item.name}</Text>
              <Text style={styles.barcodeText}>EAN : {item.barcode}</Text>
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
  searchBar: {
    height: 40,
    borderColor: "#003B73",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#003B73",
    marginBottom: 20,
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
});

export default RechercheScreen;
