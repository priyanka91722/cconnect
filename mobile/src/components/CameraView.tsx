import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

interface CameraViewProps {
  onCapture: (base64: string) => void;
}

export const CameraViewComponent: React.FC<CameraViewProps> = ({ onCapture }) => {
  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        const manipulatedImage = await manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: SaveFormat.JPEG }
        );

        // Convert to base64
        const response = await fetch(manipulatedImage.uri);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        const base64Data = base64.split(',')[1];
        onCapture(base64Data);
      } catch (error) {
        Alert.alert('Error', 'Failed to capture image');
      }
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back" />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <Text style={styles.buttonText}>Capture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
