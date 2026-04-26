import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
    AppState,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/apiService';
import { Portal } from '@gorhom/portal';

import {
    DataCaptureView,
    Camera,
    FrameSourceState,
    RectangularViewfinder,
    RectangularViewfinderStyle,
    RectangularViewfinderLineStyle,
    VideoResolution,
} from 'scandit-react-native-datacapture-core';
import {
    BarcodeCapture,
    BarcodeCaptureOverlay,
    BarcodeCaptureSession,
    BarcodeCaptureSettings,
    Symbology,
} from 'scandit-react-native-datacapture-barcode';

// Singleton partagé — à placer dans utils/dataCaptureContext.ts
import dataCaptureContext from '../../utils/dataCaptureContext';

interface Interaction {
    severity: 'Rouge' | 'Orange' | 'Vert' | 'Bleu';
    text: string;
    action?: string;
}

interface ProductData {
    name: string;
    imageUrl: string;
    interactions: Interaction[];
    sideEffects: string;
    sources: string[];
}

export default function Scan() {
    const [scannedData, setScannedData] = useState<ProductData | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [expandedAction, setExpandedAction] = useState(false);
    const [expandedSources, setExpandedSources] = useState(false);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const viewRef = useRef<DataCaptureView>(null);
    const cameraRef = useRef<Camera>(null!);
    const barcodeCaptureModeRef = useRef<BarcodeCapture>(null!);
    const overlayRef = useRef<BarcodeCaptureOverlay>(null!);
    const scanningRef = useRef(false);

    // Pattern officiel Scandit — init synchrone via ref guard
    if (!barcodeCaptureModeRef.current) {
        setupScanning();
    }
    if (!overlayRef.current) {
        overlayRef.current = setupOverlay();
    }

    // ─── Camera helpers ───────────────────────────────────────────────────────
    const startCamera = useCallback(async () => {
        await cameraRef.current?.switchToDesiredState(FrameSourceState.On);
    }, []);

    const stopCamera = useCallback(async () => {
        await cameraRef.current?.switchToDesiredState(FrameSourceState.Off);
    }, []);

    const startCapture = useCallback(async () => {
        await startCamera();
        barcodeCaptureModeRef.current.isEnabled = true;
    }, [startCamera]);

    const stopCapture = useCallback(async () => {
        barcodeCaptureModeRef.current.isEnabled = false;
        await stopCamera();
    }, [stopCamera]);

    // ─── Lifecycle ────────────────────────────────────────────────────────────
    useEffect(() => {
        const localBarcodeCapture = barcodeCaptureModeRef.current;

        // Gestion foreground/background
        const appStateSub = AppState.addEventListener('change', () => {
            if (AppState.currentState.match(/inactive|background/)) {
                stopCapture();
            } else {
                startCapture();
            }
        });

        return () => {
            appStateSub.remove();
            dataCaptureContext.removeMode(localBarcodeCapture);
        };
    }, [startCapture, stopCapture]);

    // Pause/reprise selon le BottomSheet
    useEffect(() => {
        if (scannedData) {
            barcodeCaptureModeRef.current.isEnabled = false;
        } else {
            scanningRef.current = false;
            barcodeCaptureModeRef.current.isEnabled = true;
        }
    }, [scannedData]);

    // ─── Setup Scandit (pattern officiel — synchrone, hors useEffect) ─────────
    function setupScanning() {
        const settings = new BarcodeCaptureSettings();
        settings.enableSymbologies([
            Symbology.EAN13UPCA,
            Symbology.EAN8,
            Symbology.UPCE,
            Symbology.Code128,
            Symbology.QR,
        ]);

        // ✅ new BarcodeCapture() — pas forContext()
        const barcodeCapture = new BarcodeCapture(settings);
        barcodeCaptureModeRef.current = barcodeCapture;

        setupCamera();

        const listener = {
            didScan: async (_: BarcodeCapture, session: BarcodeCaptureSession) => {
                // ✅ singulier pour BarcodeCapture
                const barcode = session.newlyRecognizedBarcode;
                if (!barcode?.data) return;
                await handleBarCodeScanned(barcode.data);
            },
        };

        barcodeCapture.addListener(listener);

        // ✅ setMode() — pas forContext()
        dataCaptureContext.setMode(barcodeCapture);
    }

    async function setupCamera() {
        const cameraSettings = BarcodeCapture.createRecommendedCameraSettings();
        cameraSettings.preferredResolution = VideoResolution.FullHD;

        const camera = Camera.withSettings(cameraSettings);
        if (!camera) throw new Error('Caméra non disponible sur cet appareil');

        cameraRef.current = camera;
        await dataCaptureContext.setFrameSource(camera);
        await camera.switchToDesiredState(FrameSourceState.On);
    }

    function setupOverlay(): BarcodeCaptureOverlay {
        if (!barcodeCaptureModeRef.current) {
            throw new Error('BarcodeCapture non initialisé');
        }

        const overlay = new BarcodeCaptureOverlay(barcodeCaptureModeRef.current);

        // Viseur rectangulaire style Scandit
        overlay.viewfinder = new RectangularViewfinder(
            RectangularViewfinderStyle.Square,
            RectangularViewfinderLineStyle.Light
        );

        return overlay;
    }

    // ─── Logique métier ───────────────────────────────────────────────────────
    const parseInteractions = (text: string): { interactions: Interaction[], sources: string[] } => {
        if (!text) return { interactions: [], sources: [] };

        let sources: string[] = [];
        let cleanedText = text;

        const sourcesMatch = text.match(/Sources\s*[:\s]+([\s\S]+?)$/i);
        if (sourcesMatch) {
            sources = sourcesMatch[1]
                .split(',')
                .map(s => s.trim())
                .filter(s => s.startsWith('http'));
            cleanedText = text.replace(sourcesMatch[0], '').trim();
        }

        const interactions: Interaction[] = [];
        const blocks = cleanedText.split('\n\n').filter(b => b.trim());

        for (const block of blocks) {
            const lines = block.split('\n');
            const firstLine = lines[0];

            let severity: 'Rouge' | 'Orange' | 'Vert' | 'Bleu' = 'Vert';
            if (firstLine.includes('[Rouge]')) severity = 'Rouge';
            else if (firstLine.includes('[Orange]')) severity = 'Orange';
            else if (firstLine.includes('[Bleu]')) severity = 'Bleu';

            const mainText = firstLine.replace(/\[(Rouge|Orange|Vert|Bleu)\]/g, '').trim();
            const actionLine = lines.find(l => l.includes('💡'));
            const action = actionLine ? actionLine.replace('💡', '').trim() : undefined;

            interactions.push({ severity, text: mainText, action });
        }

        return { interactions, sources };
    };

    const handleBarCodeScanned = async (data: string) => {
        if (scanningRef.current) return;

        scanningRef.current = true;
        setIsScanning(true);

        try {
            const productData = await apiService.scanProduct(data);
            const { interactions, sources } = parseInteractions(
                productData.complements?.effets?.patient || ''
            );

            setScannedData({
                name: productData.name,
                imageUrl: productData.image,
                interactions,
                sources,
                sideEffects: productData.complements?.effets?.indésirables || '',
            });
            bottomSheetRef.current?.snapToIndex(0);
        } catch (error) {
            console.error('Erreur lors du scan:', error);
            Alert.alert(
                'Erreur',
                'Produit non trouvé dans notre base de données.',
                [{
                    text: 'OK',
                    onPress: () => {
                        setTimeout(() => {
                            scanningRef.current = false;
                            setIsScanning(false);
                            barcodeCaptureModeRef.current.isEnabled = true;
                        }, 1000);
                    },
                }]
            );
        } finally {
            setIsScanning(false);
        }
    };

    const handleClose = () => {
        bottomSheetRef.current?.close();
        setTimeout(() => {
            setScannedData(null);
            setExpandedAction(false);
            setExpandedSources(false);
            scanningRef.current = false;
        }, 300);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Rouge': return 'bg-red-500';
            case 'Orange': return 'bg-orange-500';
            case 'Bleu': return 'bg-blue-500';
            default: return 'bg-green-500';
        }
    };

    const getSeverityTextColor = (severity: string) => {
        switch (severity) {
            case 'Rouge': return 'text-red-600';
            case 'Orange': return 'text-orange-600';
            case 'Bleu': return 'text-blue-600';
            default: return 'text-green-600';
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>

                {/* ✅ Caméra plein écran — toujours active, zéro bouton */}
                <DataCaptureView
                    style={StyleSheet.absoluteFillObject}
                    context={dataCaptureContext}
                    ref={view => {
                        if (view && !viewRef.current) {
                            view.addOverlay(overlayRef.current);
                            viewRef.current = view;
                        }
                    }}
                />

                {/* Overlay texte */}
                <View
                    style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60 }}
                    pointerEvents="none"
                >
                    <Text style={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: 16,
                        fontWeight: '600',
                        paddingHorizontal: 32,
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        paddingVertical: 10,
                        borderRadius: 12,
                        overflow: 'hidden',
                    }}>
                        {isScanning ? 'Analyse en cours...' : 'Scannez le code-barres du produit'}
                    </Text>
                    {isScanning && (
                        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 12 }} />
                    )}
                </View>

                {/* Bottom Sheet résultat */}
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

                                {/* Header */}
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
                                                {scannedData.interactions.length === 0
                                                    ? "Pas d'interaction détectée"
                                                    : scannedData.interactions.length === 1
                                                    ? `${scannedData.interactions.length} interaction détectée`
                                                    : `${scannedData.interactions.length} interactions détectées`}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={handleClose} className="p-2">
                                        <Ionicons name="close" size={24} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                {/* Interactions */}
                                {scannedData.interactions.length > 0 ? (
                                    <View className="border-t border-gray-200 pt-6">
                                        <Text className="text-lg font-semibold text-gray-800 mb-4">
                                            {scannedData.interactions.length === 1
                                                ? 'Interaction Détectée'
                                                : 'Interactions Détectées'}
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
                                                            {interaction.severity === 'Rouge' ? 'Danger élevé à connaître' :
                                                             interaction.severity === 'Orange' ? 'Risque Modéré à connaître' :
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
                                    <View className="mt-4 mb-2">
                                        <TouchableOpacity
                                            onPress={() => setExpandedAction(!expandedAction)}
                                            className="flex-row items-center justify-between bg-blue-50 p-4"
                                            style={expandedAction
                                                ? { borderTopLeftRadius: 12, borderTopRightRadius: 12 }
                                                : { borderRadius: 12 }
                                            }
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
                                                                • {interaction.action!.replace('Que faire ? ', '')}
                                                            </Text>
                                                        </View>
                                                    ))}
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* Dropdown "Sources" */}
                                {scannedData.sources.length > 0 && (
                                    <View className="mt-2 mb-6">
                                        <TouchableOpacity
                                            onPress={() => setExpandedSources(!expandedSources)}
                                            className="flex-row items-center justify-between bg-gray-50 p-4"
                                            style={expandedSources
                                                ? { borderTopLeftRadius: 12, borderTopRightRadius: 12 }
                                                : { borderRadius: 12 }
                                            }
                                        >
                                            <View className="flex-row items-center flex-1">
                                                <Text className="text-2xl mr-2">📚</Text>
                                                <Text className="text-base font-semibold text-gray-700">
                                                    Sources
                                                </Text>
                                            </View>
                                            <Ionicons
                                                name={expandedSources ? 'chevron-up' : 'chevron-down'}
                                                size={24}
                                                color="#374151"
                                            />
                                        </TouchableOpacity>
                                        {expandedSources && (
                                            <View className="bg-gray-50 rounded-b-xl px-4 pb-4 -mt-2">
                                                {scannedData.sources.map((source, index) => (
                                                    <TouchableOpacity
                                                        key={index}
                                                        onPress={() => Linking.openURL(source)}
                                                        className="mt-2"
                                                    >
                                                        <Text
                                                            className="text-xs text-blue-600 leading-5 mt-2"
                                                            numberOfLines={2}
                                                        >
                                                            • {source}
                                                        </Text>
                                                    </TouchableOpacity>
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