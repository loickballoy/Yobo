import {StyleSheet, Text, View} from 'react-native'
import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {Tabs} from 'expo-router'

const _Layout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    display: 'none',
                }
            }}
        >
            <Tabs.Screen
                name="login"
                options={{
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name={"register"}
                options={{
                    headerShown: false,
                }}
            />
        </Tabs>

    )
}
export default _Layout
const styles = StyleSheet.create({})
