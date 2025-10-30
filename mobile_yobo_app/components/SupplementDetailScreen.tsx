import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {apiService} from "@/services/apiService";

interface SupplementDetail {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    benefits: string[];
    dosage: {
        recommended: string;
        maximum: string;
        instructions: string;
    };
    sideEffects: string[];
    interactions: Array<{
        substance: string;
        effect: string;
        severity: 'low' | 'medium' | 'high';
    }>;
}

export default function SupplementDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [supplement, setSupplement] = useState<SupplementDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchSupplementDetails();
        }
    }, [id]);

    const fetchSupplementDetails = async () => {
        try {
            // Récupère les détails du complément
            const response = await apiService.getComplementDetails(id);

            // Le backend retourne un tableau, on prend le premier élément
            const complementData = response[0];

            // Parser les interactions pour extraire les détails
            const parseInteractions = (text: string) => {
                const interactions = [];
                const lines = text.split('\n');

                for (const line of lines) {
                    if (line.includes('[Rouge]') || line.includes('[Orange]') || line.includes('[Vert]')) {
                        const severity = line.includes('[Rouge]') ? 'high' :
                            line.includes('[Orange]') ? 'medium' : 'low';

                        const parts = line.split('→');
                        const substance = parts[0].replace(/\[(Rouge|Orange|Vert)\]/g, '').trim();
                        const effect = parts[1]?.split('💡')[0]?.trim() || '';

                        interactions.push({ substance, effect, severity });
                    }
                }
                return interactions;
            };

            // Parser les effets secondaires
            const parseSideEffects = (text: string) => {
                return text.split('\n')
                    .filter(line => line.trim() && !line.includes('Contre-Indications'))
                    .map(line => line.trim());
            };

            const transformedData = {
                id: id,
                name: complementData["Complément Alimentaire"] || 'Nom inconnu',
                description: complementData["Indications"] || 'Aucune description disponible',
                imageUrl: complementData["Display Image"] || '',
                benefits: complementData["Indications"]?.split('.').filter(b => b.trim()) || [],
                dosage: {
                    recommended: complementData["Dose quotidienne Recommandée"] || 'Non spécifié',
                },
                sideEffects: parseSideEffects(
                    complementData["Effets Indésirables/Contre-Indications"] || ''
                ),
                interactions: parseInteractions(
                    complementData["Effet pour le patient"] || ''
                ),
            };

            setSupplement(transformedData);
        } catch (error) {
            console.error('Erreur lors du chargement du complément:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-orange-600';
            case 'low': return 'text-yellow-600';
            default: return 'text-gray-600';
        }
    };

    const getSeverityBg = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-100';
            case 'medium': return 'bg-orange-100';
            case 'low': return 'bg-yellow-100';
            default: return 'bg-gray-100';
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-beige">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            </SafeAreaView>
        );
    }

    if (!supplement) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center px-6">
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                    <Text className="text-xl font-semibold text-gray-800 mt-4">
                        Complément introuvable
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-blue-500 px-6 py-3 rounded-xl mt-6"
                    >
                        <Text className="text-white font-semibold">Retour</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-beige">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header avec bouton retour */}
                <View className="bg-beige px-6 py-4 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="#296964" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-green-100 flex-1" numberOfLines={1}>
                        Pathologies
                    </Text>
                </View>

                {/* Image et info principale */}
                <View className="bg-beige px-6 pb-6">
                    <Text className="text-2xl font-bold text-gray-800 mb-3">
                        {supplement.name}
                    </Text>
                    <Text className="text-base text-gray-600 leading-6">
                        {supplement.description}
                    </Text>
                </View>

                {/* Bénéfices */}
                {supplement.benefits && supplement.benefits.length > 0 && (
                    <View className="bg-beige px-6 py-4 mt-2">
                        <Text className="text-lg font-semibold text-gray-800 mb-3">
                            Indications
                        </Text>
                        {supplement.benefits.map((benefit, index) => (
                            <View key={index} className="flex-row items-start mb-2">
                                <Ionicons name="checkmark-circle" size={20} color="#10B981" className="mt-0.5" />
                                <Text className="text-gray-700 ml-2 flex-1">{benefit}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Dropdown Dosage */}
                <View className="bg-beige px-6 py-4 mt-2">
                    <TouchableOpacity
                        onPress={() => toggleSection('dosage')}
                        className="flex-row items-center justify-between"
                        activeOpacity={0.7}
                    >
                        <Text className="text-lg font-semibold text-gray-800">Dosage</Text>
                        <Ionicons
                            name={expandedSection === 'dosage' ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color="#6B7280"
                        />
                    </TouchableOpacity>

                    {expandedSection === 'dosage' && (
                        <View className="mt-4">
                            <View className="mb-3">
                                <Text className="text-sm font-semibold text-gray-700 mb-1">
                                    Dose recommandée
                                </Text>
                                <Text className="text-gray-600">{supplement.dosage.recommended}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Dropdown Effets secondaires */}
                {supplement.sideEffects && supplement.sideEffects.length > 0 && (
                    <View className="bg-beige px-6 py-4 mt-2">
                        <TouchableOpacity
                            onPress={() => toggleSection('sideEffects')}
                            className="flex-row items-center justify-between"
                            activeOpacity={0.7}
                        >
                            <Text className="text-lg font-semibold text-gray-800">
                                Effets secondaires
                            </Text>
                            <Ionicons
                                name={expandedSection === 'sideEffects' ? 'chevron-up' : 'chevron-down'}
                                size={24}
                                color="#6B7280"
                            />
                        </TouchableOpacity>

                        {expandedSection === 'sideEffects' && (
                            <View className="mt-4">
                                {supplement.sideEffects.map((effect, index) => (
                                    <View key={index} className="flex-row items-start mb-2">
                                        <Ionicons name="alert-circle" size={18} color="#F59E0B" className="mt-0.5" />
                                        <Text className="text-gray-700 ml-2 flex-1">{effect}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Dropdown Interactions */}
                {supplement.interactions && supplement.interactions.length > 0 && (
                    <View className="bg-beige px-6 py-4 mt-2">
                        <TouchableOpacity
                            onPress={() => toggleSection('interactions')}
                            className="flex-row items-center justify-between"
                            activeOpacity={0.7}
                        >
                            <Text className="text-lg font-semibold text-gray-800">
                                Interactions
                            </Text>
                            <Ionicons
                                name={expandedSection === 'interactions' ? 'chevron-up' : 'chevron-down'}
                                size={24}
                                color="#6B7280"
                            />
                        </TouchableOpacity>

                        {expandedSection === 'interactions' && (
                            <View className="mt-4">
                                {supplement.interactions.map((interaction, index) => (
                                    <View
                                        key={index}
                                        className={`rounded-lg p-3 mb-3 ${getSeverityBg(interaction.severity)}`}
                                    >
                                        <Text className={`font-semibold mb-1 ${getSeverityColor(interaction.severity)}`}>
                                            {interaction.substance}
                                        </Text>
                                        <Text className="text-gray-700 text-sm">{interaction.effect}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                <View className="h-8" />
            </ScrollView>
        </SafeAreaView>
    );
}