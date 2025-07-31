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
  const [scannedName, setScannedName] = useState("");

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
      compRes.data.name = name;
      const results = compRes.data;

      console.log(`[${now}] 📊 Résultat complement pour "${name}":`, results);

      if (results.length > 0) {
        const first = results[0];
        console.log(`[${now}] ✅ Champs utiles :`);
        console.log(" - Effets Indésirables/Contre-Indications:", first["Effets Indésirables/Contre-Indications"]);
        console.log(" - Effet pour le Patient:", first["Effet pour le patient"]);
        
        setData(results);
        setImageUrl(image || null);
        setNotFound(false);
        setScannedName(name)
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
          {data.slice(0,1).map((item, idx) => {
            const effet = item["Effet pour le patient"] || item["Effet pour patient"] || "";
            const lignes = effet.split(/\r?\n/);

            const rouges = lignes
              .filter(l => /\[\s*rouge\s*]/i.test(l))
              .map(l => l.replace(/.*\[\s*rouge\s*]\s*/i, '').trim());

            const oranges = lignes
              .filter(l => /\[\s*orange\s*]/i.test(l))
              .map(l => l.replace(/.*\[\s*orange\s*]\s*/i, '').trim());

            const verts = lignes
              .filter(l => /\[\s*vert\s*]/i.test(l))
              .map(l => l.replace(/.*\[\s*vert\s*]\s*/i, '').trim());

            const bleus = lignes
              .filter(l => /\[\s*bleu\s*]/i.test(l))
              .map(l => l.replace(/.*\[\s*bleu\s*]\s*/i, '').trim());

            const BulletCircle = ({ color, showExclamation }) => (
                <View style={[styles.bulletCircle, { backgroundColor: color }]}>
                  {showExclamation && <Text style={styles.exclamation}>!</Text>}
                </View>
              );

            console.log("\n✅ Groupe d'effets extraits :", {
              rouges,
              oranges,
              bleus,
              verts
            });

            return (
              <View key={idx} style={styles.card}>

                  {/* Titre du complément */}
                  <Text style={styles.complementTitle}>{scannedName}</Text>

                  {/* Image */}
                  {imageUrl && (
                    <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
                  )}

                  {/* Compteur de risques détectés */}
                  <View style={styles.riskSummaryContainer}>
                    <View style={styles.riskBullet} />
                    <Text style={styles.riskText}>
                      {rouges.length + oranges.length + bleus.length + verts.length} Intéraction(s) détecté(s)
                    </Text>
                  </View>
                  
                  {rouges.length > 0 && (
                    <>
                      <Text style={styles.sectionSubTitleR}>Dangers élevés à connaître</Text>
                      {rouges.map((text, i) => (
                        <View key={"rouge" + i} style={styles.bulletContainer}>
                          <BulletCircle color="red" showExclamation={false} />
                          <Text style={styles.bulletText}>{text}</Text>
                        </View>
                      ))}
                    </>
                  )}

                  {oranges.length > 0 && (
                    <>
                      <Text style={styles.sectionSubTitleO}>Risques modérés à surveiller</Text>
                      {oranges.map((text, i) => (
                        <View key={"orange" + i} style={styles.bulletContainer}>
                           <BulletCircle color="#FFA500" showExclamation={false} />
                          <Text style={styles.bulletText}>{text}</Text>
                        </View>
                      ))}
                    </>
                  )}

                  {bleus.length > 0 && (
                    <>
                      <Text style={styles.sectionSubTitleB}>Risques potentiel mais faible</Text>
                      {bleus.map((text, i) => (
                        <View key={"bleu" + i} style={styles.bulletContainer}>
                          <BulletCircle color="#0077CC" showExclamation={false} />
                          <Text style={styles.bulletText}>{text}</Text>
                        </View>
                      ))}
                    </>
                  )}

                  {verts.length > 0 && (
                    <>
                      <Text style={styles.sectionSubTitleV}>Effets bénins ou rares</Text>
                      {verts.map((text, i) => (
                        <View key={"vert" + i} style={styles.bulletContainer}>
                          <BulletCircle color="#2E8B57" showExclamation={false} />
                          <Text style={styles.bulletText}>{text}</Text>
                        </View>
                      ))}
                    </>
                  )}
              </View>
            );
          })}
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
  textAlign: "left"
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
  alignItems: "center",
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
  lineHeight: 20,
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
sectionSubTitleB: {
  fontSize: 16,
  fontWeight: "600",
  marginTop: 12,
  marginBottom: 4,
  color: "#0077CC", // Bleu
},
sectionSubTitleV: {
  fontSize: 16,
  fontWeight: "600",
  marginTop: 12,
  marginBottom: 4,
  color: "#2E8B57", // Vert
},
bulletBlue: {
  marginRight: 6,
  fontSize: 16,
  color: "#0077CC",
},
bulletGreen: {
  marginRight: 6,
  fontSize: 16,
  color: "#2E8B57",
},
bulletCircle: {
  width: 18,
  height: 18,
  borderRadius: 9,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 8,
},
exclamation: {
  color: 'white',
  fontSize: 12,
  fontWeight: 'bold',
},
riskSummaryContainer: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
},

riskBullet: {
  width: 14,
  height: 14,
  borderRadius: 7,
  backgroundColor: "#2E8B57", // Orange
  marginRight: 8,
},

riskText: {
  fontSize: 16,
  fontWeight: "500",
  color: "#2E8B57",
},
});

export default ScanResultScreen;
