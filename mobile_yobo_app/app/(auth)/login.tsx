import {Text, View, TextInput, TouchableOpacity, Alert} from 'react-native'
import React, {useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useRouter} from "expo-router";
import {ActivityIndicator} from "react-native";
import axios from 'axios';

import {images} from "@/constants/images";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
    const [email, setEmail] = useState<String>("")
    const [password, setPassword] = useState<String>("")
    const [success, setSuccess] = React.useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    const router = useRouter()

    const API_BASE= "https://muka-lept.onrender.com";

    const submit = async () => {
        if (!email || !password) {
            return Alert.alert("Error", "Please enter a valid email address and password");
        }

        setLoading(true);

        try {
            // Call /token
            axios.post(`${API_BASE}/security/token`, {
                
            }).then((res) => {
                console.log(res.data);
            }).catch((err) => {
                console.log(err);
            })

            if (success) {
                router.replace("/scan");
            }
        } catch (error)  {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', padding: 20 , backgroundColor: '#EDE8D0'}}>

            <Text style={{ fontSize: 28, marginBottom: 20 }}>Se connecter</Text>


            <Text>  Email</Text>
            <TextInput
                value={email}
                placeholder="ex: example@user.com"
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 12 }} />


            <Text>  Mot de passe</Text>
            <TextInput
                value={password}
                placeholder="Mot De Passe"
                onChangeText={setPassword}
                secureTextEntry
                style={{ borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 12 }} />


            <TouchableOpacity onPress={submit} disabled={loading} style={{ backgroundColor: '#296964', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                {loading ? <ActivityIndicator /> : <Text style={{ color: 'white' }}>Se connecter</Text>}
            </TouchableOpacity>


            <TouchableOpacity onPress={() => router.push('/register')} style={{ marginTop: 12, alignItems: 'center' }}>
                <Text>Créer un compte</Text>
            </TouchableOpacity>

        </View>
    )
}
export default Login
