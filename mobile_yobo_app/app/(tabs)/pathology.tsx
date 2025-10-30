import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from '@expo/vector-icons';
import {apiService} from "@/services/apiService";
import {useRouter} from "expo-router";

interface Supplement {
    id: string;
    name: string;
    description: string;
}

interface Pathology{
    id: string;
    name: string;
    description: string;
    supplements: Supplement[];
}

export default function Pathology() {
    const router = useRouter();
    const [pathologies, setPathologies] = useState<Pathology[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // FIX 1: Ajout du tableau de dépendances vide pour éviter les appels infinis
    useEffect(() => {
        fetchPathologies();
    }, []); // <-- Tableau vide = exécution une seule fois au montage

    const fetchPathologies = async () => {
        try {
            const PathologiesResponse = await apiService.getPathologies();
            console.log(PathologiesResponse);
            const pathologiesList = PathologiesResponse;

            const PathologiesWithSupplements = await Promise.all(
                pathologiesList.map(async (pathology: string) => {
                    try {
                        const SupplementResponse = await apiService.getComplementsByPathology(pathology);
                        console.log(SupplementResponse);
                        const Supplement = SupplementResponse;

                        return {
                            id: pathology.toLowerCase().replace(/\s/g, "-"),
                            name: pathology,
                            description: `Compléments pour ${pathology}`,
                            // FIX 2: Correction de "supplement" en "supplements"
                            supplements: Supplement.map((name: string, index : number) => ({
                                id: name,
                                name: name,
                                description: 'Cliquez pour voir les détails',
                            })),
                        };
                    } catch (error) {
                        return {
                            id: pathology.toLowerCase().replace(/\s/g, "-"),
                            name: pathology,
                            description: `Compléments pour ${pathology}`,
                            // FIX 2: Correction de "supplement" en "supplements"
                            supplements: [],
                        };
                    }
                })
            );
            // FIX 2: Correction de "supplement" en "supplements"
            setPathologies(PathologiesWithSupplements.filter(p => p.supplements.length > 0));
        } catch (error) {
            console.error("Erreur lors du chargement des pathologies: ", error);
        } finally {
            setLoading(false);
        }
    }

    const togglePathology = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    }

    const navigateToSupplement = (supplementId: string) => {
        router.push(`/supplement/${supplementId}`);
    }

    const renderPathology = ({item}: {item: Pathology}) => {
        const isExpanded = expandedId === item.id;

        return (
            <View className="bg-beige rounded-xl mb-3 overflow-hidden shadow-sm">
                <TouchableOpacity
                    onPress={() => togglePathology(item.id)}
                    className="flex-row items-center justify-between p-4 border-b border-green-100"
                    activeOpacity={0.7}
                >
                    <View className="flex-1 pr-4">
                        <Text className="text-lg font-semibold text-gray-800">
                            {item.name}
                        </Text>
                        {item.description && (
                            <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
                                {item.description}
                            </Text>
                        )}
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={24}
                        color="#6B7280"
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View className="px-4 pb-4 border-t border-gray-100">
                        <Text className="text-sm font-semibold text-gray-700 mt-3 mb-2">
                            Compléments alimentaires recommandés
                        </Text>
                        {item.supplements.map((supplement, index) => (
                            <TouchableOpacity
                                key={supplement.id}
                                onPress={() => navigateToSupplement(supplement.id)}
                                className={`flex-row items-center justify-between py-3 ${
                                    index !== item.supplements.length - 1 ? 'border-b border-green-200' : ''
                                }`}
                                activeOpacity={0.6}
                            >
                                <View className="flex-1 pr-4">
                                    <Text className="text-base text-gray-800 font-medium">
                                        •  {supplement.name}
                                    </Text>
                                    {supplement.description && (
                                        <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
                                            {supplement.description}
                                        </Text>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        )
    }


    return (
        <SafeAreaView className="flex-1 bg-beige" edges={['top']}>
            <View className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 bg-beige">
                    <Text className="text-2xl font-bold text-gray-800">Pathologies</Text>
                    <Text className="text-sm text-gray-500 mt-1">
                        Explorez les compléments alimentaires par pathologie
                    </Text>
                </View>

                {/* Liste des pathologies */}
                {/* FIX 3: Suppression du View wrapper pour éviter les problèmes de scroll */}
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#3B82F6" />
                    </View>
                ) : pathologies.length === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <Ionicons name="medical-outline" size={64} color="#D1D5DB" />
                        <Text className="text-gray-400 mt-4 text-center">
                            Aucune pathologie disponible
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={pathologies}
                        renderItem={renderPathology}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: 24,
                            paddingTop: 16,
                            paddingBottom: 100
                        }}

                    />
                )}
            </View>
        </SafeAreaView>
    );
}