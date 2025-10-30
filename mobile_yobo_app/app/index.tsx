import {Text, View, StyleSheet, Image, TouchableOpacity} from "react-native";
import imageModule from "expo-image/src/ImageModule";
import {images} from "@/constants/images";
import {useRouter} from "expo-router";
import axios from 'axios';
import {useCallback, useEffect, useState} from "react";

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
    const router = useRouter();
    const [username, setUsername] = useState<String|null>("undefined");
    const [password, setPassword] = useState<String|null>("");
    const [isAuthenticated, setAuthenticated] = useState<boolean>(false);

    const api = axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        timeout: 10000,
    })

    useEffect(() => {
        const retrieveUsername = async () => {
            try {
                const uname = await AsyncStorage.getItem("username");
                console.log(uname);
                if (uname !== null){
                    setUsername(uname);
                    const pwd = await AsyncStorage.getItem("password");
                    setPassword(pwd);
                }
            }
            catch (error){
                console.error(error);
            }
        }

        const setToken = async (token: string) => {
            try {
                await AsyncStorage.setItem("token", token);
            }
            catch (error) {
                console.error(error);
            }
        }

        if (username === ""){
            retrieveUsername();
            console.log(username);
            if (username !== null && username !== "undefined") {
                setAuthenticated(true);
                console.log(`${username} is authenticated`);
            }
        }
    }, [username, password]);

    return (
      <View style={styles.header}>
          <View style={styles.imageContainer}>
              <Image source={images.headerLogo} style={styles.headerLogo} resizeMode={"contain"} />
          </View>
          <View style={styles.textContainer}>
              <Text style={styles.welcomeText}>Bienvenue sur Yobo!</Text>
              <Text style={styles.subText}>
                  L'application Indépendante qui t'aide a en apprendre plus sur tes compléments alimentaires
              </Text>
          </View>
          <View style={styles.buttonSection}>
              <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={() => {isAuthenticated ? router.replace("/scan") : router.replace("/login")}}
              >
                  <Text style={styles.buttonText}>Commencer</Text>
              </TouchableOpacity>
          </View>

      </View>
  );
}

const styles = StyleSheet.create({
    header: {
        flex: 1,
        backgroundColor: "#EDE8D0"
    },
    headerLogo :{
        width: 250,
        height: 250,
    },
    welcomeText: {
        fontSize: 40,
        color: "#296964",
        fontWeight: "bold",
        marginBottom: 40,
        textAlign: "center"
    },
    subText: {
        fontSize: 12,
        color: "#296964",
        textAlign: "center",
    },
    imageContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    textContainer:{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
    },
    buttonSection: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonContainer: {
        width: "60%",
        borderRadius: 12,
        overflow: "hidden",
        justifyContent: "center",
        backgroundColor: "#296964",
        paddingHorizontal: 30,
        paddingVertical: 10,
        flexDirection: "row",
    },
    buttonText: {
        fontSize: 12,
        color: "white",
        textAlign: "center",
    }
})
