import {View, Text, StyleSheet, Button} from 'react-native'
import {CameraView, CameraType, useCameraPermissions} from 'expo-camera';
import React from 'react'

const Scan = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing] = React.useState<CameraType>('back');

    if (!permission) {
        return <View style={styles.container}><Text>Demande De permission</Text></View>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text>Permission Caméra requise.</Text>
                <Button onPress={requestPermission} title={"grant permission"}/>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing={facing}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    cameraWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        flex: 1
    }
});

export default Scan
