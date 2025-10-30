import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Register() {
    const router = useRouter();
    const { signup } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        // Validation
        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);

        try {
            await signup(email, password, fullName);
            // La redirection est automatique grâce au Context
        } catch (error: any) {
            Alert.alert(
                'Erreur d\'inscription',
                error.message || 'Une erreur est survenue'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-beige">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="flex-1 px-6 pt-8">
                        {/* Bouton retour */}
                        <TouchableOpacity
                            onPress={handleBackToLogin}
                            className="flex-row items-center mb-6"
                        >
                            <Ionicons name="arrow-back" size={24} color="#374151" />
                            <Text className="text-gray-700 ml-2 text-base">Retour</Text>
                        </TouchableOpacity>

                        {/* Titre */}
                        <Text className="text-4xl font-bold text-gray-800 mb-2">
                            Créer un compte
                        </Text>
                        <Text className="text-gray-500 mb-8">
                            Rejoignez-nous pour profiter de toutes les fonctionnalités
                        </Text>

                        {/* Formulaire */}
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2 font-medium">Nom complet</Text>
                            <TextInput
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Jean Dupont"
                                autoCapitalize="words"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2 font-medium">Email</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="votre@email.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2 font-medium">Mot de passe</Text>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                secureTextEntry
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                            />
                            <Text className="text-xs text-gray-500 mt-1">
                                Minimum 6 caractères
                            </Text>
                        </View>

                        <View className="mb-6">
                            <Text className="text-gray-700 mb-2 font-medium">
                                Confirmer le mot de passe
                            </Text>
                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="••••••••"
                                secureTextEntry
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSignup}
                            disabled={loading}
                            className="bg-green-100 rounded-xl py-4 mb-4"
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-center font-semibold text-lg">
                                    S'inscrire
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row justify-center">
                            <Text className="text-gray-600">Déjà un compte ? </Text>
                            <TouchableOpacity onPress={handleBackToLogin}>
                                <Text className="text-blue-500 font-semibold">Se connecter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}