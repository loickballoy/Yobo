import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/apiService';

import {Portal} from '@gorhom/portal';

interface Interaction {
    severity: 'Rouge' | 'Orange' | 'Vert' | 'Bleu';
    text: string;
    action?: string; // Le texte après 💡
}

interface ProductData {
    name: string;
    imageUrl: string;
    interactions: Interaction[];
    sideEffects: string;
}

export default function Scan() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scannedData, setScannedData] = useState<ProductData | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [expandedAction, setExpandedAction] = useState(false);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const [hasShownError, setHasShownError] = useState(false);
    const scanningRef = useRef(false);

    // Parser les interactions depuis le texte
    const parseInteractions = (text: string): Interaction[] => {
        if (!text) return [];

        const interactions: Interaction[] = [];
        const blocks = text.split('\n\n').filter(b => b.trim());

        for (const block of blocks) {
            const lines = block.split('\n');
            const firstLine = lines[0];

            // Détecter la sévérité
            let severity: 'Rouge' | 'Orange' | 'Vert' | 'Bleu' = 'Vert';
            if (firstLine.includes('[Rouge]')) severity = 'Rouge';
            else if (firstLine.includes('[Orange]')) severity = 'Orange';
            else if (firstLine.includes('[Bleu]')) severity = 'Bleu';

            // Extraire le texte principal et l'action
            const mainText = firstLine.replace(/\[(Rouge|Orange|Vert|Bleu)\]/g, '').trim();
            const actionLine = lines.find(l => l.includes('💡'));
            const action = actionLine ? actionLine.replace('💡', '').trim() : undefined;

            interactions.push({
                severity,
                text: mainText,
                action,
            });
        }

        return interactions;
    };

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanningRef.current) return; // Bloque le scan si déjà en cours ou produit déjà scanné

        scanningRef.current = true;
        setIsScanning(true);
        setHasShownError(false);

        try {
            const productData = await apiService.scanProduct(data);
            const transformedData: ProductData = {
                name: productData.name,
                imageUrl: productData.image,
                interactions: parseInteractions(productData.complements?.effets?.patient || ''),
                sideEffects: productData.complements?.effets?.indésirables || '',
            };

            setScannedData(transformedData);
            bottomSheetRef.current?.snapToIndex(0); // Snap à 25%
        } catch (error) {

            if (!hasShownError) {
                setHasShownError(true);
                Alert.alert(
                    "Erreur",
                    "Une erreur s'est produite lors du scan.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                // Réinitialiser après 2 secondes
                                setTimeout(() => {
                                    scanningRef.current = false;
                                    setIsScanning(false);
                                    setHasShownError(false);
                                }, 2000);
                            }
                        }
                    ]
                );
            }

            console.error('Erreur lors du scan:', error);
            alert('Produit non trouvé dans notre base de données');
        } finally {
            setIsScanning(false);
        }
    };

    const handleClose = () => {
        bottomSheetRef.current?.close();
        console.log("scan ready");
        setScannedData(null); // Réinitialise pour permettre un nouveau scan
        setExpandedAction(false);
        scanningRef.current = false;
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Rouge': return 'bg-red-500';
            case 'Orange': return 'bg-orange-500';
            case 'Bleu': return 'bg-blue-500';
            case 'Vert': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getSeverityTextColor = (severity: string) => {
        switch (severity) {
            case 'Rouge': return 'text-red-600';
            case 'Orange': return 'text-orange-600';
            case 'Bleu': return 'text-blue-600';
            case 'Vert': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    if (!permission) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-900">
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-900 px-6">
                <Ionicons name="camera-outline" size={64} color="#fff" />
                <Text className="text-white text-xl font-semibold mt-4 text-center">
                    Permission caméra requise
                </Text>
                <Text className="text-gray-400 text-center mt-2 mb-6">
                    Nous avons besoin d'accéder à votre caméra pour scanner les produits
                </Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="bg-blue-500 px-8 py-3 rounded-xl"
                >
                    <Text className="text-white font-semibold text-lg">
                        Autoriser l'accès
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View className="flex-1">
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={scannedData ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ['ean13', 'ean8', 'upc_a', 'qr'],
                    }}
                />

                {/* Overlay de scan */}
                <View className="flex-1 justify-center items-center">
                    <View className="w-64 h-64 border-2 border-white rounded-3xl" />
                    <Text className="text-white text-center mt-6 text-lg font-semibold px-8">
                        {isScanning ? 'Analyse en cours...' : 'Scannez le code-barres du produit'}
                    </Text>
                </View>

                {/* Bottom Sheet */}
                {scannedData && (
                    <Portal hostName="bottomSheetHost">
                        <BottomSheet
                            ref={bottomSheetRef}
                            snapPoints={['25%', '75%']}
                            enablePanDownToClose={true}
                            onClose={handleClose}
                            backgroundStyle={{ backgroundColor: '#fff' }}
                            handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}
                        >
                            <BottomSheetScrollView className="flex-1 px-6">
                                {/* Header avec image, nom et nombre d'interactions */}
                                <View className="flex-row items-center mb-6">
                                    <Image
                                        source={{ uri: scannedData.imageUrl }}
                                        className="w-20 h-20 rounded-xl"
                                        resizeMode="cover"
                                    />
                                    <View className="flex-1 ml-4">
                                        <Text className="text-xl font-bold text-gray-800" numberOfLines={2}>
                                            {scannedData.name}
                                        </Text>
                                        <View className="flex-row items-center mt-2">
                                            <View className={`w-3 h-3 rounded-full ${
                                                scannedData.interactions.some(i => i.severity === 'Rouge') ? 'bg-red-500' :
                                                    scannedData.interactions.some(i => i.severity === 'Orange') ? 'bg-orange-500' :
                                                        'bg-green-500'
                                            }`} />
                                            <Text className="text-gray-600 ml-2">
                                                {scannedData.interactions.length === 0 ? "Pas d'interaction détécté" :
                                                    scannedData.interactions.length === 1 ? `${scannedData.interactions.length} interaction détéctée` :
                                                        `${scannedData.interactions.length} interactions détéctées`}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={handleClose} className="p-2">
                                        <Ionicons name="close" size={24} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                {/* Interactions détaillées (visibles au swipe up) */}
                                {scannedData.interactions.length > 0 ? (
                                    <View className="border-t border-gray-200 pt-6">
                                        <Text className="text-lg font-semibold text-gray-800 mb-4">
                                            {scannedData.interactions.length === 0 ? "Pas d'Interaction Détéctée" :
                                                    scannedData.interactions.length === 1 ? `Interaction Détéctée` :
                                                        `Interactions Détéctées`}
                                        </Text>

                                        {scannedData.interactions.map((interaction, index) => (
                                            <View
                                                key={index}
                                                className={`rounded-xl p-4 mb-3 border-l-4 ${
                                                    interaction.severity === 'Rouge' ? 'border-red-500 bg-red-50' :
                                                        interaction.severity === 'Orange' ? 'border-orange-500 bg-orange-50' :
                                                            interaction.severity === 'Bleu' ? 'border-blue-500 bg-blue-50' :
                                                                'border-green-500 bg-green-50'
                                                }`}
                                            >
                                                <View className="flex-row items-center mb-2">
                                                    <View className={`px-3 py-1 rounded-full ${getSeverityColor(interaction.severity)}`}>
                                                        <Text className="text-white text-xs font-semibold">
                                                            {interaction.severity === 'Rouge' ? 'Danger élevés à connaitre' :
                                                                interaction.severity === 'Orange' ? 'Risque Modéré à connaitre' :
                                                                    interaction.severity === 'Bleu' ? 'Risque Potentiel mais faible' :
                                                                        'Effets bénins ou rare'}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Text className={`text-sm font-medium ${getSeverityTextColor(interaction.severity)} mb-2`}>
                                                    {interaction.text}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <View className="items-center py-8">
                                        <Ionicons name="checkmark-circle" size={64} color="#10B981" />
                                        <Text className="text-lg font-semibold text-gray-800 mt-4">
                                            Aucune interaction détectée
                                        </Text>
                                        <Text className="text-gray-500 text-center mt-2">
                                            Ce produit ne présente pas d'interactions connues
                                        </Text>
                                    </View>
                                )}

                                {/* Dropdown "Que faire ?" */}
                                {scannedData.interactions.some(i => i.action) && (
                                    <View className="mt-4 mb-6">
                                        <TouchableOpacity
                                            onPress={() => setExpandedAction(!expandedAction)}
                                            className="flex-row items-center justify-between bg-blue-50 rounded-xl p-4"
                                        >
                                            <View className="flex-row items-center flex-1">
                                                <Text className="text-2xl mr-2">💡</Text>
                                                <Text className="text-base font-semibold text-blue-700">
                                                    Que faire ?
                                                </Text>
                                            </View>
                                            <Ionicons
                                                name={expandedAction ? 'chevron-up' : 'chevron-down'}
                                                size={24}
                                                color="#1D4ED8"
                                            />
                                        </TouchableOpacity>

                                        {expandedAction && (
                                            <View className="bg-blue-50 rounded-b-xl px-4 pb-4 -mt-2">
                                                {scannedData.interactions
                                                    .filter(i => i.action)
                                                    .map((interaction, index) => (
                                                        <View key={index} className="mt-3">
                                                            <Text className="text-sm text-gray-700 leading-5">
                                                                • {interaction.action?.replace("Que faire ? ", "") ?? ""}
                                                            </Text>
                                                        </View>
                                                    ))}
                                            </View>
                                        )}
                                    </View>
                                )}

                                <View className="h-8" />
                            </BottomSheetScrollView>
                        </BottomSheet>
                    </Portal>
                )}
            </View>
        </GestureHandlerRootView>
    );
}