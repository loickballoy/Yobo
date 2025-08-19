// MicronutrientDetailsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {Ionicons} from "@expo/vector-icons";
import axios from "axios";

const { width, height } = Dimensions.get("window");
const API_BASE = "https://muka-lept.onrender.com"; //"http://192.168.1.60:5001";

const MicronutrientDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { name, pathology } = route.params;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    axios.get(`${API_BASE}/complement/${encodeURIComponent(pathology)}/${encodeURIComponent(name)}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur chargement complément:", err);
        setLoading(false);
      });
  }, [name]);

  useEffect(() => {
    navigation.setOptions({
      title: "Détail du complément",
      headerBackTitle: "Pathologies",
      headerTintColor: "#003B73",
      headerTitleStyle: {
        fontWeight: "bold",
        color: "#003B73"
      },
    });
  }, [navigation]);

  const handleMomentumScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentPage(index);
  };

  const BulletCircle = ({ color }) => (
    <View style={[styles.bulletCircle, { backgroundColor: color }]}/>
  ); 

  const BulletBlue = ({ text }) => (
    <View style={styles.bulletContainer}>
      <View style={[styles.bulletCircle, { backgroundColor: "#0077CC" }]} />
      <Text style={styles.label}>{text}</Text>
    </View>
  );

    const BulletLine = ({ text, color }) => (
    <View style={styles.bulletContainer}>
      <View style={[styles.bulletCircle, { backgroundColor: "#0077CC" }]} />
      <Text style={styles.label}>{text}</Text>
    </View>
  );

  const renderCardOne = (item) => (
    <ScrollView contentContainerStyle={styles.cardScroll}>
      <View style={styles.card}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.sectionTitle}>Dose Recommandée</Text>
        {item["Dose quotidienne Recommandée"] && <BulletBlue text={item["Dose quotidienne Recommandée"]} />}
        {item["Dose Quotidienne Recommandée"] && <BulletBlue text={item["Dose Quotidienne Recommandée"]} />}
        <Text style={styles.sectionTitle}>Indications</Text>
        {item["Indications"] && <BulletBlue text={item["Indications"]} />}
      </View>
    </ScrollView>
  );


   const renderCardTwo = (item) => {
    const effet = item["Effet pour le patient"] || item["Effets pour le patient"] || item["Effet pour le Patient"] || "";
    const lignes = effet.split(/\r?\n/);

    const rouges = lignes.filter(l => /\[\s*rouge\s*]/i.test(l)).map(l => l.replace(/.*\[\s*rouge\s*]\s*/i, '').trim());
    const oranges = lignes.filter(l => /\[\s*orange\s*]/i.test(l)).map(l => l.replace(/.*\[\s*orange\s*]\s*/i, '').trim());
    const bleus = lignes.filter(l => /\[\s*bleu\s*]/i.test(l)).map(l => l.replace(/.*\[\s*bleu\s*]\s*/i, '').trim());
    const verts = lignes.filter(l => /\[\s*vert\s*]/i.test(l)).map(l => l.replace(/.*\[\s*vert\s*]\s*/i, '').trim());

    const effetsIndesirables = item["Effets Indésirables/Contre-Indications"] || "";
    const lignesIndesirables = effetsIndesirables.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

    return (
      <ScrollView contentContainerStyle={styles.cardScroll}>
        <View style={styles.card}>
          {lignesIndesirables.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Effets Indésirables et Contre-Indications</Text>
              {lignesIndesirables.map((line, i) => (
                <BulletLine key={`ind-${i}`} text={line} color="red" />
              ))}
              <Text style={styles.sectionTitle}>Interactions</Text>
            </>
          )}
          
          {rouges.length > 0 && (
            <>
              <Text style={styles.sectionSubTitleR}>Dangers élevés à connaître</Text>
              {rouges.map((text, i) => (
                <View key={"rouge" + i} style={styles.bulletContainer}>
                  <BulletCircle color="red" />
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
                  <BulletCircle color="#FFA500" />
                  <Text style={styles.bulletText}>{text}</Text>
                </View>
              ))}
            </>
          )}

          {bleus.length > 0 && (
            <>
              <Text style={styles.sectionSubTitleB}>Risques potentiels mais faibles</Text>
              {bleus.map((text, i) => (
                <View key={"bleu" + i} style={styles.bulletContainer}>
                  <BulletCircle color="#0077CC" />
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
                  <BulletCircle color="#2E8B57" />
                  <Text style={styles.bulletText}>{text}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#003B73" />
      ) : (
        <>
          <ScrollView 
            horizontal 
            pagingEnabled
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{width: width * 2}}>
            {data.map((item, idx) => (
              <React.Fragment key={idx}>
                <View key={`card1-${idx}`} style={styles.page}>{renderCardOne(item)}</View>
                <View key={`card2-${idx}`} style={styles.page}>{renderCardTwo(item)}</View>
              </React.Fragment>
            ))}
          </ScrollView>
          <View style={styles.paginationContainer}>
            <View style={styles.pagination}>
              {[0, 1].map((i) => (
                <View
                  key={i}
                  style={[styles.dot, currentPage === i ? styles.dotActive : null]}
                />
              ))}
            </View>
          </View>  
        </>
        
      )}
    </View>            
  );
};

const styles = StyleSheet.create({
/*  container: {
    flex: 1,
    backgroundColor: "#FAFAF5",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderColor: "#C8D8E4",
    borderWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#003B73",
    marginBottom: 14,
  },
  section: {
    fontSize: 16,
    color: "#001F54",
    marginBottom: 10,
    lineHeight: 22,
  },
  label: {
    fontWeight: "bold",
    color: "#003B73",
  },
  pathology: {
    fontSize: 14,
    color: "#888",
    marginTop: 12,
    fontStyle: "italic",
  }
*/

  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  page: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  cardScroll: { paddingBottom: 60 },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
    maxWidth: width - 32,
  },
  paginationContainer: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#003B73',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003B73",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#003B73",
    textAlign: "wrap",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#001F54",
    flexWrap: "wrap",
  },
  bulletContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: "#001F54",
  },
  bulletCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sectionSubTitleR: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
    color: "#AD0000",
  },
  sectionSubTitleO: {
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
    color: "#0077CC",
  },
  sectionSubTitleV: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
    color: "#2E8B57",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003B73",
    marginTop: 10,
    marginBottom: 5,
    textAlign: "center",
  },
});

export default MicronutrientDetailsScreen;
