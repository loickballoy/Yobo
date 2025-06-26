// ScanScreen.js
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { CameraView, Camera, CameraType, useCameraPermissions } from 'expo-camera';
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import {useRoute, useNavigation} from "@react-navigation/native"

const API_BASE = "http://192.168.1.60:5001";

const ScanScreen = () => {
  const facing= useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);


  const handleBarcodeScanned = async ({ type, data }) => {
    if (scanned) return;
    setScanned(true); // Stop future scans
    console.log("Code trouvé :", data);

    
    try{
       navigation.navigate("ScanResultScreen", {ean: data});

    }
    catch (err){
      console.error("Scan error", err);
      Alert.alert("Erreur de scan");
    }
    finally {
      setTimeout(() => setScanned(false), 3000);
    }
    
  };

  if (!permission) {
    return <View style={styles.container}><Text>Demande d'autorisation...</Text></View>;
  }

  if (!permission.granted) {
    return <View style={styles.container}><Text>Accès à la caméra refusé</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan</Text>

      <View style={styles.cameraWrapper}>
        <CameraView
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code39', 'code128'],
          }}
          style={styles.camera}
          facing={facing}
          ratio= "16:9"
        />
      </View>

      <Text style={styles.instructions}>Placez votre produit dans le cadre pour le scanner.</Text>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF5",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#003B73",
    marginBottom: 20,
  },
  cameraWrapper: {
    width: "100%",
    aspectRatio: 2.5,
    borderRadius: 16,
    overflow: "hidden",
    borderColor: "#003B73",
    borderWidth: 3,
    backgroundColor: "#000",
    marginBottom: 30
  },
  camera: {
    flex: 1,
  },
  instructions: {
    marginTop: 20,
    fontSize: 16,
    color: "#001F54",
    textAlign: "center",
    marginBottom: 30
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#003B73",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    marginBottom: 500
  },
});

export default ScanScreen;