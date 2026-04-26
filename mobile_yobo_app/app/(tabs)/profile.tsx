import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Portal } from '@gorhom/portal';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import { router } from 'expo-router';

interface ScannedProduct {
    id: string;
    name: string;
    imageUrl: string;
    scannedAt: string;
    barcode: string; // ✅ Nécessaire pour re-fetcher les détails
}

interface Interaction {
    severity: 'Rouge' | 'Orange' | 'Vert' | 'Bleu';
    text: string;
    action?: string;
}

interface ProductDetail {
    name: string;
    imageUrl: string;
    interactions: Interaction[];
    sideEffects: string;
    sources: string[];
}

export default function Profile() {
    const { user, logout } = useAuth();
    const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // État du bottom sheet de détail
    const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [expandedAction, setExpandedAction] = useState(false);
    const [expandedSources, setExpandedSources] = useState(false);
    const bottomSheetRef = useRef<BottomSheet>(null);

    useEffect(() => {
        fetchScannedHistory();
    }, []);

    const fetchScannedHistory = async () => {
        try {
            const data = await apiService.getScanHistory();
            const transformedData = data.map(item => ({
                id: item.id || item.uuid,
                name: item.product_name,
                imageUrl: item.img_url,
                scannedAt: item.created_at,
                barcode: item.barcode || item.ean || '',  // ✅ Adapte selon ton API
            }));
            setScannedProducts(transformedData);
        } catch (error) {
            console.error("Erreur lors du chargement de l'historique:", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Parser identique à scan.tsx
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

    // ✅ Ouvre le bottom sheet avec les données complètes
    const handleProductPress = async (item: ScannedProduct) => {
        if (!item.barcode) {
            // Si pas de barcode dispo, affiche juste les infos de base
            setSelectedProduct({
                name: item.name,
                imageUrl: item.imageUrl,
                interactions: [],
                sideEffects: '',
                sources: [],
            });
            bottomSheetRef.current?.snapToIndex(0);
            return;
        }

        setDetailLoading(true);
        setSelectedProduct({
            name: item.name,
            imageUrl: item.imageUrl,
            interactions: [],
            sideEffects: '',
            sources: [],
        });
        bottomSheetRef.current?.snapToIndex(0);

        try {
            const productData = await apiService.scanProduct(item.barcode);
            const { interactions, sources } = parseInteractions(
                productData.complements?.effets?.patient || ''
            );
            setSelectedProduct({
                name: productData.name,
                imageUrl: productData.image,
                interactions,
                sources,
                sideEffects: productData.complements?.effets?.indésirables || '',
            });
        } catch (error) {
            console.error('Erreur chargement détail produit:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetail = () => {
        bottomSheetRef.current?.close();
        setTimeout(() => {
            setSelectedProduct(null);
            setExpandedAction(false);
            setExpandedSources(false);
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

    const handleLogout = () => {
        setModalVisible(false);
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Déconnexion',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            Alert.alert('Erreur', 'Erreur lors de la déconnexion');
                        }
                    },
                },
            ]
        );
        router.replace('/login');
    };

    const handleDeleteAccount = () => {
        setModalVisible(false);
        Alert.alert(
            'Supprimer le compte',
            'Cette action est irréversible. Êtes-vous sûr ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: async () => {} },
            ]
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const renderProduct = ({ item }: { item: ScannedProduct }) => (
        <TouchableOpacity
            onPress={() => handleProductPress(item)}
            className="flex-row bg-beige rounded-xl p-4 mb-3 shadow-sm active:opacity-70"
        >
            <Image
                source={{ uri: item.imageUrl }}
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
            />
            <View className="flex-1 ml-4 justify-center">
                <Text className="text-lg font-semibold text-gray-800" numberOfLines={2}>
                    {item.name}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                    {formatDate(item.scannedAt)}
                </Text>
            </View>
            <View className="justify-center ml-2">
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView className="flex-1 bg-beige">
                <View className="flex-1">
                    {/* Header */}
                    <View className="flex-row justify-between items-center px-6 py-4 bg-beige">
                        <View>
                            <Text className="text-2xl font-bold text-green-100">Mon Profil</Text>
                            {user && (
                                <Text className="text-sm text-gray-500 mt-1">{user.email}</Text>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className="p-2"
                        >
                            <Ionicons name="settings-outline" size={28} color="#296964" />
                        </TouchableOpacity>
                    </View>

                    {/* Historique */}
                    <View className="flex-1 px-6 pt-4">
                        <Text className="text-lg font-semibold text-green-100 mb-3">
                            Historique des scans
                        </Text>

                        {loading ? (
                            <View className="flex-1 justify-center items-center">
                                <ActivityIndicator size="large" color="#3B82F6" />
                            </View>
                        ) : scannedProducts.length === 0 ? (
                            <View className="flex-1 justify-center items-center">
                                <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
                                <Text className="text-gray-400 mt-4 text-center">
                                    Aucun produit scanné pour le moment
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={scannedProducts.sort((a, b) =>
                                    new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
                                )}
                                renderItem={renderProduct}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            />
                        )}
                    </View>
                </View>

                {/* Modal paramètres */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableOpacity
                        className="flex-1 bg-black/50"
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    >
                        <View className="flex-1 justify-end">
                            <TouchableOpacity activeOpacity={1}>
                                <View className="bg-white rounded-t-3xl px-6 py-8">
                                    <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

                                    <TouchableOpacity
                                        onPress={() => setModalVisible(false)}
                                        className="flex-row items-center py-4 border-b border-gray-100"
                                    >
                                        <Ionicons name="mail-outline" size={24} color="#3B82F6" />
                                        <Text className="text-lg text-gray-800 ml-4">
                                            Changer mon email
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={handleLogout}
                                        className="flex-row items-center py-4 border-b border-gray-100"
                                    >
                                        <Ionicons name="log-out-outline" size={24} color="#F59E0B" />
                                        <Text className="text-lg text-gray-800 ml-4">
                                            Se déconnecter
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={handleDeleteAccount}
                                        className="flex-row items-center py-4"
                                    >
                                        <Ionicons name="trash-outline" size={24} color="#EF4444" />
                                        <Text className="text-lg text-red-500 ml-4">
                                            Supprimer mon compte
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setModalVisible(false)}
                                        className="bg-gray-100 rounded-xl py-4 mt-6"
                                    >
                                        <Text className="text-center text-gray-700 font-semibold text-lg">
                                            Annuler
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* ✅ Bottom Sheet détail produit — même UI que scan.tsx */}
                {selectedProduct && (
                    <Portal hostName="bottomSheetHost">
                        <BottomSheet
                            ref={bottomSheetRef}
                            snapPoints={['25%', '75%']}
                            enablePanDownToClose={true}
                            onClose={handleCloseDetail}
                            backgroundStyle={{ backgroundColor: '#fff' }}
                            handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}
                        >
                            <BottomSheetScrollView className="flex-1 px-6">

                                {/* Header produit */}
                                <View className="flex-row items-center mb-6">
                                    <Image
                                        source={{ uri: selectedProduct.imageUrl }}
                                        className="w-20 h-20 rounded-xl"
                                        resizeMode="cover"
                                    />
                                    <View className="flex-1 ml-4">
                                        <Text className="text-xl font-bold text-gray-800" numberOfLines={2}>
                                            {selectedProduct.name}
                                        </Text>
                                        {detailLoading ? (
                                            <ActivityIndicator size="small" color="#6B7280" style={{ marginTop: 8 }} />
                                        ) : (
                                            <View className="flex-row items-center mt-2">
                                                <View className={`w-3 h-3 rounded-full ${
                                                    selectedProduct.interactions.some(i => i.severity === 'Rouge') ? 'bg-red-500' :
                                                    selectedProduct.interactions.some(i => i.severity === 'Orange') ? 'bg-orange-500' :
                                                    'bg-green-500'
                                                }`} />
                                                <Text className="text-gray-600 ml-2">
                                                    {selectedProduct.interactions.length === 0
                                                        ? "Pas d'interaction détectée"
                                                        : selectedProduct.interactions.length === 1
                                                        ? `${selectedProduct.interactions.length} interaction détectée`
                                                        : `${selectedProduct.interactions.length} interactions détectées`}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <TouchableOpacity onPress={handleCloseDetail} className="p-2">
                                        <Ionicons name="close" size={24} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                {/* Loader pendant le fetch des interactions */}
                                {detailLoading ? (
                                    <View className="items-center py-8">
                                        <ActivityIndicator size="large" color="#3B82F6" />
                                        <Text className="text-gray-400 mt-4">Chargement des interactions...</Text>
                                    </View>
                                ) : (
                                    <>
                                        {/* Interactions */}
                                        {selectedProduct.interactions.length > 0 ? (
                                            <View className="border-t border-gray-200 pt-6">
                                                <Text className="text-lg font-semibold text-gray-800 mb-4">
                                                    {selectedProduct.interactions.length === 1
                                                        ? 'Interaction Détectée'
                                                        : 'Interactions Détectées'}
                                                </Text>

                                                {selectedProduct.interactions.map((interaction, index) => (
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
                                        {selectedProduct.interactions.some(i => i.action) && (
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
                                                        {selectedProduct.interactions
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
                                        {selectedProduct.sources.length > 0 && (
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
                                                        {selectedProduct.sources.map((source, index) => (
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
                                    </>
                                )}

                                <View className="h-8" />
                            </BottomSheetScrollView>
                        </BottomSheet>
                    </Portal>
                )}
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}