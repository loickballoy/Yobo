import {StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator} from 'react-native'
import React from 'react'
import {useRouter} from "expo-router";
import {Alert} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Register = () => {
    const [password, setPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [full_name, setFullName] = React.useState('')
    const [loading, setLoading] = React.useState<boolean>(false)

    const router = useRouter()

    const API_BASE= "https://muka-lept.onrender.com";

    const submit = async () => {
        if (!password || !email || !full_name || !confirmPassword) {
            return Alert.alert("Error", "Please fill the form completely.");
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
        }
        setLoading(true);

        try {
            // Call Sign UP
            axios.post(`${API_BASE}/auth/signup`, {
                email: email,
                password: password,
                full_name: full_name,
                disabled: false,
            }).then((res) => {
                console.log(res)
                AsyncStorage.setItem("token", res.data.JWTtoken);
            }).catch((error) => {
                Alert.alert(error.message);
            })
            const token = await AsyncStorage.getItem("token");
            if (token) {
                console.log(`token : ${token}`);
                router.replace("/login");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', padding: 20 , backgroundColor: '#EDE8D0'}}>

            <Text style={{ fontSize: 28, marginBottom: 20 }}>S'Inscrire</Text>


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

            <Text>  Confirmez le Mot de passe</Text>
            <TextInput
                value={confirmPassword}
                placeholder="Confirmez Mot De Passe"
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={{ borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 12 }} />

            <Text>  Nom et Prénom</Text>
            <TextInput
                value={full_name}
                placeholder="ex: Jhon Doe"
                onChangeText={setFullName}
                style={{ borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 12 }} />

            <TouchableOpacity onPress={submit} disabled={loading} style={{ backgroundColor: '#296964', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                {loading ? <ActivityIndicator /> : <Text style={{ color: 'white' }}>S'Inscrire</Text>}
            </TouchableOpacity>


            <TouchableOpacity onPress={() => router.push('/login')} style={{ marginTop: 12, alignItems: 'center' }}>
                <Text>Se Connecter</Text>
            </TouchableOpacity>

        </View>
    )
}
export default Register
const styles = StyleSheet.create({})
