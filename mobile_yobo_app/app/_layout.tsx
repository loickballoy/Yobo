import { Stack, useRouter, useSegments } from "expo-router";
import './globals.css'
import {useEffect} from "react";
import {AuthProvider, useAuth} from "@/contexts/AuthContext";

function RootLayoutNav() {

    const { isAuthenticated, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
    if (isLoading) return; // Attendre que l'authentification soit vérifiée

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
        // Si pas connecté et pas dans les écrans d'auth, rediriger vers login
        router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
        // Si connecté et dans les écrans d'auth, rediriger vers l'app
        router.replace('/scan');
    }
    }, [isAuthenticated, isLoading, segments]);

    return (
        <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(auth)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
                name="supplement/[id]"
                options={{ headerShown: false }}
            />
        </Stack>
    );
}


export default function RootLayout() {
    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    )
}