import {View, Text, Image, ImageBackground} from 'react-native'
import React from 'react'
import {Tabs} from "expo-router";
import {PortalProvider} from "@gorhom/portal";

import {images} from "@/constants/images";
import {icons} from "@/constants/icons";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {PortalHost} from "@gorhom/portal/src";

function TabIcon({focused, icon, title}: any) {
    if (focused) {
        return (
            <ImageBackground
                source={images.highlight}
                className="flex flex-row flex-1 min-w-[128px] min-h-16 mt-4 justify-center items-center rounded-full
                overflow-hidden"
            >
                <Image source={icon} className="size-5"/>
                <Text className="text-accent text-base font-semibold ml-2">{title}</Text>
            </ImageBackground>
        );
    }

    return (
        <View className="size-full justify-center items-center mt-4 rounded-full">
            <Image source={icon} className="size-5"/>
        </View>
    );
}

const _Layout = () => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PortalProvider>
                <Tabs
                    screenOptions={{
                        tabBarShowLabel: false,
                        tabBarItemStyle: {
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems:'center',
                        },
                        tabBarStyle: {
                            backgroundColor: '#296964',
                            borderRadius: 50,
                            marginHorizontal: 20,
                            marginBottom: 36,
                            height: 52,
                            position: 'absolute',
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: '#296964',
                        }
                    }}
                >
                    <Tabs.Screen
                        name="profile"
                        options={{
                            title: "profile",
                            headerShown: false,
                            tabBarIcon: ({ focused }) => (
                                <TabIcon focused={focused} icon={icons.profile} title="Profile" />
                            )
                        }}
                    />
                    <Tabs.Screen
                        name={"scan"}
                        options={{
                            title: "scan",
                            headerShown: false,
                            tabBarIcon: ({ focused }) => (
                                <TabIcon focused={focused} icon={icons.scan} title="Scan" />
                            )
                        }}
                    />
                    <Tabs.Screen
                        name={"pathology"}
                        options={{
                            title: "pathology",
                            headerShown: false,
                            tabBarIcon: ({ focused }) => (
                                <TabIcon focused={focused} icon={icons.pathology} title="Pathologies" />
                            )
                        }}
                    />
                </ Tabs>
                <PortalHost name="bottomSheetHost" />
            </PortalProvider>
        </GestureHandlerRootView>

    )
}
export default _Layout
