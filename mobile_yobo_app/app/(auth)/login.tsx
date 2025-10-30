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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth(); // ✅ Utilisation du Context
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);

        try {
            await login(email, password); // ✅ Le Context gère tout
            // La redirection est automatique grâce au RootLayoutNav
        } catch (error: any) {
            Alert.alert(
                'Erreur de connexion',
                error.message || 'Email ou mot de passe incorrect'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = () => {
        router.push('/register');
    };

    return (
        <SafeAreaView className="flex-1 bg-beige">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1 justify-center px-6">
                    <Text className="text-4xl font-bold text-gray-800 mb-2">
                        Bienvenue
                    </Text>
                    <Text className="text-gray-500 mb-8">
                        Connectez-vous pour continuer
                    </Text>

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

                    <View className="mb-6">
                        <Text className="text-gray-700 mb-2 font-medium">Mot de passe</Text>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loading}
                        className="bg-green-100 rounded-xl py-4 mb-4"
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-semibold text-lg">
                                Se connecter
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center">
                        <Text className="text-gray-600">Pas encore de compte ? </Text>
                        <TouchableOpacity onPress={handleSignup}>
                            <Text className="text-blue-500 font-semibold">S'inscrire</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}