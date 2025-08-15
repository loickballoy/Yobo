// ScanScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const ScanScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  const handleBarcodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    console.log("Code trouvé :", data);
    navigation.navigate("ScanResultScreen", { ean: data });
    setTimeout(() => setScanned(false), 3000);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    navigation.navigate("ScanResultScreen", { ean: manualCode.trim() });
    setManualCode("");
    Keyboard.dismiss();
  };

  if (!permission) {
    return <View style={styles.container}><Text>Demande d'autorisation...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Permission caméra requise.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Autoriser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.cameraWrapper}>
          <CameraView
            onBarcodeScanned={handleBarcodeScanned}
            style={styles.camera}
            autoFocus="on"
            whiteBalance="auto"
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a"],
            }}
          />
          <View style={styles.scanBox} />
        </View>

        <View style={styles.manualContainer}>
          <Text style={styles.manualLabel}>Code-barres manuel :</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.manualInput}
              placeholder="Entrez un code-barres"
              value={manualCode}
              onChangeText={setManualCode}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={handleManualSubmit}
            />
            <TouchableOpacity onPress={handleManualSubmit} style={styles.submitButton}>
              <Ionicons name="arrow-forward-circle" size={28} color="#003B73" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  cameraWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  scanBox: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: "#00BFFF",
    borderRadius: 12,
    zIndex: 2,
  },
  manualContainer: {
    padding: 20,
    backgroundColor: "#FAFAF5",
  },
  manualLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#003B73",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  manualInput: {
    flex: 1,
    height: 48,
    borderColor: "#003B73",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#003B73",
  },
  submitButton: {
    marginLeft: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#003B73",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ScanScreen;

 /* useEffect(() => {
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

export default ScanScreen;*/