import React, {useEffect, useState} from "react";
import {View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, Image} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import {useRoute, useNavigation} from "@react-navigation/native"

const API_BASE = "https://muka-lept.onrender.com"; //"http://192.168.1.60:5001";

const ScanResultScreen = () => {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { ean } = params;

  const [data, setData] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchComplement = async () => {
    try {
      const now = new Date().toLocaleString();
      console.log(`[${now}] 🛰️ Début fetch pour EAN: ${ean}`);

      const res = await axios.get(`${API_BASE}/qrcode/${ean}`);
      const name = res.data.name;
      const image = res.data.image;

      console.log(`[${now}] 📦 Résultat QR code:`, res.data);

      if (!name) {
        setNotFound(true);
        return;
      }

      const compRes = await axios.get(`${API_BASE}/complement/${encodeURIComponent(name)}`);
      const results = compRes.data;

      console.log(`[${now}] 📊 Résultat complement pour "${name}":`, results);

      if (results.length > 0) {
        const first = results[0];
        console.log(`[${now}] ✅ Champs utiles :`);
        console.log(" - Effets Indésirables/Contre-Indications:", first["Effets Indésirables/Contre-Indications"]);
        console.log(" - Effet pour le Patient:", first["Effet pour le Patient"]);
        
        setData(results);
        setImageUrl(image || null);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      const now = new Date().toLocaleString();
      console.error(`[${now}] ❌ Erreur lors du scan`, err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  fetchComplement();
}, [ean]);

  const renderFormattedText = (value) => {
  if (!value) return null;

  const fullLineColorMatch = value.match(/^\[(rouge|orange|bleu|vert)\]\s*(.*)/i);
  if (fullLineColorMatch) {
    const color = fullLineColorMatch[1].toLowerCase();
    const text = fullLineColorMatch[2];
    return <Text style={{ color }}>{text}</Text>;
  }

  const labelBlockMatch = value.match(/\[Couleur\s*:\s*(\w+)\]/i);
  const color = labelBlockMatch ? labelBlockMatch[1].toLowerCase() : "#001F54";

  return <Text style={{ color }}>{value}</Text>;
};

  const parseColoredText = (text) => {
    const regex = /\[([a-zA-Z]+)](.*?)(\[\/\1])/g;
    const parts = [];
    let lastIndex = 0;

    let match;
    while ((match = regex.exec(text)) !== null) {
      const before = text.substring(lastIndex, match.index);
      if (before) parts.push(<Text key={lastIndex}>{before}</Text>);

      const color = match[1].toLowerCase();
      const colored = match[2];
      parts.push(
        <Text key={match.index} style={{ color }}>{colored}</Text>
      );

      lastIndex = regex.lastIndex;
    }

    const remaining = text.substring(lastIndex);
    if (remaining) parts.push(<Text key={"last"}>{remaining}</Text>);

    return parts;
  };

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

    {/* Titre du complément */}
    <Text style={styles.complementTitle}>{item["Complément Alimentaire"]}</Text>

    {/* Indications + Dose */}
    <Text style={styles.section}>
      <Text style={styles.label}>Indications :</Text> {item["Indications"]}
    </Text>

    {/* Image */}
    {imageUrl && (
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
    )}

    {/* Effets indésirables / contre-indications */}
    <Text style={styles.sectionTitle}>Effets Indésirables / Contre-Indications</Text>
    {item["Effets Indésirables/Contre-Indications"]
      ?.split("\n")
      .filter(line => line.trim())
      .map((line, i) => (
        <View key={"ei" + i} style={styles.bulletContainer}>
          <Text style={styles.bullet}>•</Text>
        <Text style={styles.bulletText}>{line.trim().replace(/^[-–]\s*/, "")}</Text>
        </View>
      ))}

    {/* Effets pour le patient */}
    <Text style={styles.sectionTitle}>Effets pour le Patient</Text>
    {/* Groupe Gravité Élevée */}
    <Text style={styles.sectionSubTitleR}>Gravité : Élevée</Text>
     {(item["Effet pour le Patient"]?.match(/\[Rouge\]\s*(.*)/gi) || []).map((line, i) => {
  const match = line.match(/\[Rouge\]\s*(.*)/i);
  return match ? (
    <View key={"rouge" + i} style={styles.bulletContainer}>
      <Text style={styles.bulletRed}>⚠️</Text>
      <Text style={styles.bulletText}>{match[1].trim().replace(/^- /, '')}</Text>
    </View>
  ) : null;
})}

    {/* Groupe Gravité Modérée */}
    <Text style={styles.sectionSubTitleO}>Gravité : Modérée</Text>
{(item["Effet pour le Patient"]?.match(/\[Orange\]\s*(.*)/gi) || []).map((line, i) => {
  const match = line.match(/\[Orange\]\s*(.*)/i);
  return match ? (
    <View key={"orange" + i} style={styles.bulletContainer}>
      <Text style={styles.bulletOrange}>❗</Text>
      <Text style={styles.bulletText}>{match[1].trim().replace(/^- /, '')}</Text>
    </View>
  ) : null;
})}

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
  image: {
    width: "100%",
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  section: { fontSize: 16, marginBottom: 6, color: "#001F54" },
  label: { fontWeight: "bold", color: "#003B73" },

  complementTitle: {
  fontSize: 22,
  fontWeight: "bold",
  color: "#003B73",
  marginBottom: 10,
  textAlign: "center"
},
sectionTitle: {
  fontSize: 18,
  fontWeight: "600",
  marginTop: 16,
  marginBottom: 8,
  color: "#000000"
},
bulletContainer: {
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: 6,
},
bullet: {
  marginRight: 6,
  fontSize: 16,
  color: "#003B73",
},
bulletRed: {
  marginRight: 6,
  fontSize: 16,
  color: "red",
},
bulletOrange: {
  marginRight: 6,
  fontSize: 16,
  color: "#FFA500",
},
bulletText: {
  flex: 1,
  fontSize: 15,
  color: "#001F54",
},
sectionSubTitleR:{
fontSize: 16,
  fontWeight: "600",
  marginTop: 12,
  marginBottom: 4,
  color: "#AD0000",
},
sectionSubTitleO:{
fontSize: 16,
  fontWeight: "600",
  marginTop: 12,
  marginBottom: 4,
  color: "#FFA500",
},
});

export default ScanResultScreen;
