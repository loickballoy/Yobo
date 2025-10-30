import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext'; // ✅ Import du Context
import { apiService } from '../../services/apiService';
import {router} from "expo-router";

interface ScannedProduct {
    id: string;
    name: string;
    imageUrl: string;
    scannedAt: string;
}

export default function Profile() {
    const { user, logout } = useAuth(); // ✅ Accès direct à user et logout
    const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchScannedHistory();
    }, []);

    const fetchScannedHistory = async () => {
        try {
            const data = await apiService.getScanHistory(); // ✅ Utilisation du service

            // Transformer les données pour correspondre au format attendu
            const transformedData = data.map(item => ({
                id: item.id || item.uuid,
                name: item.product_name,
                imageUrl: item.img_url,
                scannedAt: item.created_at,
            }));

            setScannedProducts(transformedData);
        } catch (error) {
            console.error('Erreur lors du chargement de l\'historique:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeEmail = () => {
        setModalVisible(false);
        // Navigation vers la page de changement d'email
        // router.push('/change-email');
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
                            await logout(); // ✅ Utilisation du Context
                            // La redirection est automatique
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
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        // Logique de suppression
                        // await deleteAccount();
                    },
                },
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
        <View className="flex-row bg-beige rounded-xl p-4 mb-3 shadow-sm">
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
        </View>
    );

    return (
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
                            data={scannedProducts.sort(function(a, b){
                                return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
                            })}
                            renderItem={renderProduct}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    )}
                </View>
            </View>

            {/* Modal des paramètres */}
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
                                    onPress={handleChangeEmail}
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
        </SafeAreaView>
    );
}