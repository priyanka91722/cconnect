import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraViewComponent } from '../components/CameraView';
import { useChannelStore } from '../store/useChannelStore';
import { extractTextFromImage } from '../services/api';
import Markdown from 'react-native-markdown-display';

export const WhiteboardCaptureScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { channelId } = route.params as { channelId: string };
  const { addMessage } = useChannelStore();

  const [step, setStep] = useState<'camera' | 'preview' | 'loading'>('camera');
  const [markdownContent, setMarkdownContent] = useState('');

  const handleCapture = async (base64: string) => {
    setStep('loading');
    try {
      const markdown = await extractTextFromImage(base64);
      setMarkdownContent(markdown);
      setStep('preview');
    } catch (error) {
      Alert.alert('Error', 'Failed to process image. Please try again.');
      setStep('camera');
    }
  };

  const handlePostToChannel = () => {
    addMessage(channelId, markdownContent);
    navigation.goBack();
  };

  const handleRetake = () => {
    setStep('camera');
    setMarkdownContent('');
  };

  if (step === 'camera') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Snap Whiteboard</Text>
        <CameraViewComponent onCapture={handleCapture} />
      </View>
    );
  }

  if (step === 'loading') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Processing...</Text>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Extracting text from image...</Text>
      </View>
    );
  }

  if (step === 'preview') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Preview</Text>
        <ScrollView style={styles.previewContainer}>
          <Markdown style={markdownStyles}>{markdownContent}</Markdown>
        </ScrollView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <Text style={styles.retakeButtonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postButton} onPress={handlePostToChannel}>
            <Text style={styles.postButtonText}>Post to Channel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  retakeButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retakeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

const markdownStyles = {
  body: {
    color: '#333',
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  paragraph: {
    marginBottom: 8,
  },
  listItem: {
    marginBottom: 4,
  },
  codeBlock: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  codeInline: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 4,
    borderRadius: 2,
    fontFamily: 'monospace',
  },
};
